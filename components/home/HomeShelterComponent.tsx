import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserType } from "@/types/enums/userType";
import HomeInfoCard from "../HomeInfoCard";
import { PetHome } from "@/types/interfaces/PetHome";
import HomePetList from "../HomePetList";
import { Pet } from "@/types/interfaces/Pet";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function HomeShelterComponent({
  shelterId,
}: {
  shelterId: string;
}) {
  const [petHome, setPetHome] = useState<PetHome>({
    dog: [],
    cat: [],
    other: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get<PetHome>("/api/petsHome", {
        params: { shelterId, limitEachCategory: 10 },
      })
      .then((res) => {
        setPetHome(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [shelterId]);

  const handleFavorite = async (petId: string) => {
    const findOld = (list: Pet[]) => list.find((p) => p.id === petId);
    const old =
      findOld(petHome.dog) || findOld(petHome.cat) || findOld(petHome.other);
    if (!old) return;
    const newStatus = !old.isFavorite;

    setPetHome((prev) => ({
      dog: prev.dog.map((p) =>
        p.id === petId ? { ...p, isFavorite: newStatus } : p,
      ),
      cat: prev.cat.map((p) =>
        p.id === petId ? { ...p, isFavorite: newStatus } : p,
      ),
      other: prev.other.map((p) =>
        p.id === petId ? { ...p, isFavorite: newStatus } : p,
      ),
    }));

    try {
      await axios.post("/api/pets/favorites", {
        shelterId,
        petId,
        isFavorite: newStatus,
      });
    } catch (error: unknown) {
      console.error("Toggle favorite failed:", error);
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      }

      setPetHome((prev) => ({
        dog: prev.dog.map((p) =>
          p.id === petId ? { ...p, isFavorite: old.isFavorite } : p,
        ),
        cat: prev.cat.map((p) =>
          p.id === petId ? { ...p, isFavorite: old.isFavorite } : p,
        ),
        other: prev.other.map((p) =>
          p.id === petId ? { ...p, isFavorite: old.isFavorite } : p,
        ),
      }));
    }
  };

  const handleClick = (petId: string) => {
    console.log(`Pet with ID ${petId} clicked`);
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Icon
          icon="mdi:loading"
          className="inline-block h-12 w-12 animate-spin"
        />
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <HomeInfoCard />
        </div>
      </div>
      <div className="lg:col-span-2">
        <HomePetList
          petHome={petHome}
          userType={UserType.SHELTER}
          onFavoriteClick={handleFavorite}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
