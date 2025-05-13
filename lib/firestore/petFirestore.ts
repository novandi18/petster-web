import { PetHome } from "@/types/interfaces/PetHome";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  startAfter,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { chunkArray } from "@/utils/chunkArray";
import { PetFilterState } from "@/types/states/petFilterState";
import { ShelterLocation } from "@/types/interfaces/ShelterLocation";
import { applyGeofencing } from "@/utils/applyGeofencing";
import { Response } from "@/types/interfaces/Response";
import { Pet } from "@/types/interfaces/Pet";
import { PetDetail } from "@/types/interfaces/PetDetail";
import { Volunteer } from "@/types/interfaces/Volunteer";
import { VolunteerDashboard } from "@/types/interfaces/VolunteerDashboard";
import { NewPet } from "@/types/constants/NewPet";
import { UpdatePet } from "@/types/interfaces/UpdatePet";

export async function getPetsHome(
  shelterId: string,
  limitEachCategory: number = 10,
): Promise<PetHome> {
  if (!shelterId) {
    throw new Error("shelterId is required");
  }

  const categories = ["Dog", "Cat", "Other"];
  const petHome: PetHome = { dog: [], cat: [], other: [] };
  const favoritePetIds: Set<string> = new Set();

  try {
    const favoritesSnapshot = await getDocs(
      query(
        collection(db, "favorited_pets"),
        where("shelterId", "==", shelterId),
      ),
    );
    favoritesSnapshot.forEach((doc) => {
      favoritePetIds.add(doc.data().petId);
    });

    for (const category of categories) {
      const petSnapshot = await getDocs(
        query(
          collection(db, "pets"),
          where("category", "==", category),
          where("adopted", "==", false),
          orderBy("createdAt", "desc"),
          limit(limitEachCategory),
        ),
      );
      const pets: Pet[] = [];
      petSnapshot.forEach((doc) => {
        const data = doc.data() as Pet;
        pets.push({
          ...data,
          id: doc.id,
          isFavorite: favoritePetIds.has(doc.id),
        });
      });
      if (category === "Dog") petHome.dog = pets;
      else if (category === "Cat") petHome.cat = pets;
      else petHome.other = pets;
    }

    const allIds = [...petHome.dog, ...petHome.cat, ...petHome.other].map(
      (p) => p.id,
    );
    const viewCounts = await getPetViewCounts(allIds);

    petHome.dog = petHome.dog.map((p) => ({
      ...p,
      viewCount: viewCounts[p.id] || 0,
    }));
    petHome.cat = petHome.cat.map((p) => ({
      ...p,
      viewCount: viewCounts[p.id] || 0,
    }));
    petHome.other = petHome.other.map((p) => ({
      ...p,
      viewCount: viewCounts[p.id] || 0,
    }));
  } catch (error) {
    console.error("Error fetching pets: ", error);
    throw new Error("Failed to fetch pets");
  }

  return petHome;
}

export const getPets = async (
  limitCount: number,
  shelterId?: string,
  startAfterKey?: string,
  filter?: PetFilterState,
  shelterLocation?: ShelterLocation,
  radiusKm: number = 10.0,
): Promise<{ pets: Pet[]; nextPageKey: string | null; totalPages: number }> => {
  try {
    let petsQuery = query(
      collection(db, "pets"),
      orderBy("createdAt", "desc"),
      where("adopted", "==", false),
      limit(limitCount),
    );

    let countQuery = query(
      collection(db, "pets"),
      where("adopted", "==", false),
    );

    if (filter) {
      console.log("Filter: ", filter);
      if (filter.selectedCategory) {
        petsQuery = query(
          petsQuery,
          where("category", "==", filter.selectedCategory),
        );
        countQuery = query(
          countQuery,
          where("category", "==", filter.selectedCategory),
        );
      }
      if (filter.selectedGender) {
        petsQuery = query(
          petsQuery,
          where("gender", "==", filter.selectedGender),
        );
        countQuery = query(
          countQuery,
          where("gender", "==", filter.selectedGender),
        );
      }
      if (filter.selectedAdoptionFeeRange) {
        switch (filter.selectedAdoptionFeeRange) {
          case "Free":
            petsQuery = query(petsQuery, where("adoptionFee", "==", null));
            countQuery = query(countQuery, where("adoptionFee", "==", null));
            break;
          case "< Rp 500rb":
            petsQuery = query(petsQuery, where("adoptionFee", "<", 500000));
            countQuery = query(countQuery, where("adoptionFee", "<", 500000));
            break;
          case "Rp 500rb - 1jt":
            petsQuery = query(
              petsQuery,
              where("adoptionFee", ">=", 500000),
              where("adoptionFee", "<=", 1000000),
            );
            countQuery = query(
              countQuery,
              where("adoptionFee", ">=", 500000),
              where("adoptionFee", "<=", 1000000),
            );
            break;
          case "> Rp 1jt":
            petsQuery = query(petsQuery, where("adoptionFee", ">", 1000000));
            countQuery = query(countQuery, where("adoptionFee", ">", 1000000));
            break;
        }
      }
      if (filter.selectedVaccinated) {
        const vaccinated = filter.selectedVaccinated === "Yes" ? true : false;
        petsQuery = query(petsQuery, where("vaccinated", "==", vaccinated));
        countQuery = query(countQuery, where("vaccinated", "==", vaccinated));
      }
      if (filter.selectedSize) {
        petsQuery = query(petsQuery, where("size", "==", filter.selectedSize));
        countQuery = query(
          countQuery,
          where("size", "==", filter.selectedSize),
        );
      }
    }

    if (startAfterKey) {
      const startDoc = await getDoc(doc(db, "pets", startAfterKey));
      if (startDoc.exists()) {
        petsQuery = query(petsQuery, startAfter(startDoc));
      }
    }

    const querySnapshot = await getDocs(petsQuery);
    const pets = querySnapshot.docs.map((d) => ({
      ...(d.data() as Pet),
      id: d.id,
    }));

    const countSnapshot = await getDocs(countQuery);
    const totalCount = countSnapshot.size;
    const totalPages = Math.max(1, Math.ceil(totalCount / limitCount));

    let favoritedPetIds: string[] = [];

    if (shelterId) {
      const favoritedSnapshot = await getDocs(
        query(
          collection(db, "favorited_pets"),
          where("shelterId", "==", shelterId),
        ),
      );
      favoritedPetIds = favoritedSnapshot.docs.map((doc) => doc.data().petId);
    }

    const petIds = pets.map((pet) => pet.id);
    const viewCounts = await getPetViewCounts(petIds);

    const updatedPets = pets.map((pet) => ({
      ...pet,
      isFavorite: favoritedPetIds.includes(pet.id),
      viewCount: viewCounts[pet.id] || 0,
    }));

    let finalPets = updatedPets;
    if (shelterLocation) {
      const geoPets = await applyGeofencing(
        finalPets,
        shelterLocation,
        radiusKm,
      );
      finalPets = geoPets.map((p) => ({
        ...p,
        viewCount: p.viewCount ?? 0,
      }));
    }

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]?.id;

    return {
      pets: finalPets,
      nextPageKey: lastVisible || null,
      totalPages,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error("Error fetching pets: " + message);
  }
};

const getPetViewCounts = async (petIds: string[]) => {
  const viewCounts: Record<string, number> = {};

  const petIdBatches = chunkArray(petIds, 10);
  for (const batch of petIdBatches) {
    const viewsSnapshot = await getDocs(
      query(collection(db, "pet_views"), where("petId", "in", batch)),
    );

    viewsSnapshot.docs.forEach((doc) => {
      const petId = doc.data().petId;
      if (petId) {
        viewCounts[petId] = (viewCounts[petId] || 0) + 1;
      }
    });
  }

  return viewCounts;
};

export async function getPetById(
  id: string,
  shelterId?: string,
): Promise<Response<PetDetail>> {
  try {
    const petDocRef = doc(db, "pets", id);
    const petDoc = await getDoc(petDocRef);
    if (!petDoc.exists()) {
      return Response.Error("Pet not found");
    }

    const rawPet = petDoc.data() as Pet;

    const viewsSnapshot = await getDocs(
      query(collection(db, "pet_views"), where("petId", "==", id)),
    );
    const viewCount = viewsSnapshot.size;

    const pet: PetDetail["pet"] = {
      ...rawPet,
      id: petDoc.id,
      viewCount,
    };

    if (shelterId) {
      const favSnap = await getDocs(
        query(
          collection(db, "favorited_pets"),
          where("petId", "==", id),
          where("shelterId", "==", shelterId),
          limit(1),
        ),
      );
      pet.isFavorite = !favSnap.empty;
    }

    let volunteer: Volunteer | undefined;
    if (typeof pet.volunteer === "string") {
      const vid = pet.volunteer.includes("/")
        ? pet.volunteer.split("/").pop()!
        : pet.volunteer;
      const volRef = doc(db, "volunteers", vid);
      const volDoc = await getDoc(volRef);
      if (volDoc.exists()) {
        volunteer = volDoc.data() as Volunteer;
      }
    }

    return Response.Success({ pet, volunteer });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.Error(`Error fetching pet: ${msg}`);
  }
}

export async function getVolunteerDashboard(
  volunteerId: string,
): Promise<Response<VolunteerDashboard>> {
  try {
    const volunteerPath = `volunteers/${volunteerId}`;

    const allPetsQ = query(
      collection(db, "pets"),
      where("volunteer", "==", volunteerPath),
    );
    const allPetsSnap = await getDocs(allPetsQ);
    const petIds = allPetsSnap.docs.map((d) => d.id);
    const totalPets = petIds.length;

    const adoptedQ = query(
      collection(db, "pets"),
      where("volunteer", "==", volunteerPath),
      where("adopted", "==", true),
    );
    const adoptedSnap = await getDocs(adoptedQ);
    const totalAdoptedPets = adoptedSnap.size;

    let totalPetsViewed = 0;
    if (petIds.length > 0) {
      const batches = chunkArray(petIds, 10);
      for (const batch of batches) {
        const viewsQ = query(
          collection(db, "pet_views"),
          where("petId", "in", batch),
        );
        const viewsSnap = await getDocs(viewsQ);
        totalPetsViewed += viewsSnap.size;
      }
    }

    return Response.Success({ totalPets, totalAdoptedPets, totalPetsViewed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.Error(message);
  }
}

export async function getPetsByVolunteer(
  volunteerId: string,
  limitCount: number,
  startAfterKey?: string,
): Promise<
  Response<{
    pets: Pet[];
    nextPageKey: string | null;
    totalPages: number;
  }>
> {
  try {
    const volunteerPath = `volunteers/${volunteerId}`;

    const countQ = query(
      collection(db, "pets"),
      where("volunteer", "==", volunteerPath),
    );
    const countSnap = await getDocs(countQ);
    const totalCount = countSnap.size;
    const totalPages = Math.max(1, Math.ceil(totalCount / limitCount));

    let petsQ = query(
      collection(db, "pets"),
      where("volunteer", "==", volunteerPath),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    if (startAfterKey) {
      const startDoc = await getDoc(doc(db, "pets", startAfterKey));
      if (startDoc.exists()) {
        petsQ = query(petsQ, startAfter(startDoc));
      }
    }

    const snap = await getDocs(petsQ);
    let pets = snap.docs.map((d) => ({
      ...(d.data() as Pet),
      id: d.id,
    }));

    const viewCounts: Record<string, number> = {};
    for (const pet of pets) {
      const viewsSnap = await getDocs(
        query(collection(db, "pet_views"), where("petId", "==", pet.id)),
      );
      viewCounts[pet.id] = viewsSnap.size;
    }

    pets = pets.map((p) => ({
      ...p,
      viewCount: viewCounts[p.id] ?? 0,
    }));

    const nextPageKey = snap.docs[snap.docs.length - 1]?.id ?? null;

    return Response.Success({ pets, nextPageKey, totalPages });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.Error(msg);
  }
}

export async function togglePetAdopted(
  petId: string,
  adopted: boolean,
): Promise<Response<string>> {
  try {
    const petRef = doc(db, "pets", petId);
    await updateDoc(petRef, { adopted });
    const statusText = adopted ? "adopted" : "available";
    return Response.Success(`Pet is now marked as ${statusText}.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.Error(`Failed to update pet status: ${message}`);
  }
}

export async function addPet(
  volunteerId: string,
  data: NewPet,
): Promise<Response<string>> {
  try {
    const docRef = await addDoc(collection(db, "pets"), {
      ...data,
      volunteer: `volunteers/${volunteerId}`,
      adopted: false,
      isFavorite: false,
      createdAt: serverTimestamp(),
    });
    return Response.Success(docRef.id);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.Error(`Failed to create pet: ${msg}`);
  }
}

export async function deletePetById(petId: string): Promise<Response<string>> {
  try {
    const viewsQ = query(
      collection(db, "pet_views"),
      where("petId", "==", petId),
    );
    const viewsSnap = await getDocs(viewsQ);
    for (const vdoc of viewsSnap.docs) {
      await deleteDoc(vdoc.ref);
    }

    const favQ = query(
      collection(db, "favorited_pets"),
      where("petId", "==", petId),
    );
    const favSnap = await getDocs(favQ);
    for (const fdoc of favSnap.docs) {
      await deleteDoc(fdoc.ref);
    }

    const petRef = doc(db, "pets", petId);
    await deleteDoc(petRef);

    return Response.Success("Pet and related data deleted successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.Error(`Failed to delete pet: ${msg}`);
  }
}

export async function updatePet(
  volunteerId: string,
  petId: string,
  data: UpdatePet,
): Promise<Response<string>> {
  try {
    const petRef = doc(db, "pets", petId);
    const updateData: Partial<UpdatePet & { volunteer: string }> = {
      ...data,
      volunteer: `volunteers/${volunteerId}`,
    };
    if (data.image == null) {
      delete updateData.image;
    }
    await updateDoc(petRef, updateData);
    return Response.Success("Pet updated successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.Error(`Failed to update pet: ${msg}`);
  }
}

export async function addPetView(
  petId: string,
  shelterId: string,
): Promise<Response<string>> {
  try {
    if (!petId || !shelterId) {
      return Response.Error("Pet ID and Shelter ID cannot be empty");
    }

    const timestamp = serverTimestamp();

    const existingViewQuery = query(
      collection(db, "pet_views"),
      where("petId", "==", petId),
      where("shelterId", "==", shelterId),
      limit(1),
    );

    const existingViewSnapshot = await getDocs(existingViewQuery);

    if (!existingViewSnapshot.empty) {
      const existingDoc = existingViewSnapshot.docs[0];
      await updateDoc(existingDoc.ref, { timestamp });
    } else {
      await addDoc(collection(db, "pet_views"), {
        petId,
        shelterId,
        timestamp,
      });
    }

    return Response.Success("Pet view recorded successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.Error(`Failed to record pet view: ${msg}`);
  }
}

export async function getAllPetIds(): Promise<string[]> {
  const snap = await getDocs(collection(db, "pets"));
  return snap.docs.map((doc) => doc.id);
}
