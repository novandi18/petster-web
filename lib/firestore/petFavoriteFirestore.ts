import { Response } from "@/types/interfaces/Response";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  startAfter,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Pet } from "@/types/interfaces/Pet";

export const getPetFavorites = async (
  shelterId: string,
  limitCount: number,
  startAfterKey?: string,
): Promise<
  Response<{ pets: Pet[]; nextPageKey: string | null; totalPages: number }>
> => {
  try {
    let petsQuery = query(
      collection(db, "favorited_pets"),
      where("shelterId", "==", shelterId),
      limit(limitCount),
    );

    if (startAfterKey) {
      const startDoc = await getDoc(doc(db, "favorited_pets", startAfterKey));
      if (startDoc.exists()) {
        petsQuery = query(petsQuery, startAfter(startDoc));
      }
    }

    const favoritedSnapshot = await getDocs(petsQuery);
    const petIds = favoritedSnapshot.docs.map((doc) => doc.get("petId"));

    if (petIds.length === 0) {
      return Response.Success({ pets: [], nextPageKey: null, totalPages: 1 });
    }

    const petsList: Pet[] = [];

    for (const id of petIds) {
      const petDoc = await getDoc(doc(db, "pets", id));
      if (petDoc.exists()) {
        const petData = petDoc.data() as Pet;
        petsList.push({
          ...petData,
          id: petDoc.id,
          isFavorite: true,
        });
      }
    }

    const lastVisible =
      favoritedSnapshot.docs[favoritedSnapshot.docs.length - 1]?.id;
    const nextPageKey = lastVisible || null;

    const totalPages = Math.max(1, Math.ceil(petIds.length / limitCount));

    return Response.Success({
      pets: petsList,
      nextPageKey,
      totalPages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.Error("Error fetching favorite pets: " + message);
  }
};

export const toggleFavoritePet = async (
  petId: string,
  shelterId: string,
  isFavorite: boolean,
): Promise<Response<{ message: string }>> => {
  try {
    if (!petId || !shelterId) {
      return Response.Error("Pet ID and Shelter ID cannot be empty");
    }

    const favoriteQuery = query(
      collection(db, "favorited_pets"),
      where("petId", "==", petId),
      where("shelterId", "==", shelterId),
      limit(1),
    );

    const existingFavoriteSnapshot = await getDocs(favoriteQuery);

    if (isFavorite) {
      if (existingFavoriteSnapshot.empty) {
        const favoriteData = {
          petId,
          shelterId,
          timestamp: Timestamp.now(),
        };

        const docRef = doc(collection(db, "favorited_pets"));
        await setDoc(docRef, favoriteData);
        return Response.Success({
          message: "Pet added to favorites successfully",
        });
      }
    } else {
      if (!existingFavoriteSnapshot.empty) {
        const docToDelete = existingFavoriteSnapshot.docs[0];
        await deleteDoc(docToDelete.ref);
        return Response.Success({
          message: "Pet removed from favorites successfully",
        });
      }
    }

    return Response.Success({
      message: "Pet favorite status updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error toggling favorite pet:", error);
    return Response.Error("Failed to update pet favorite status");
  }
};
