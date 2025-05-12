"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import PetCard from "@/components/PetCard";
import Pagination from "@/components/Pagination";
import { Pet } from "@/types/interfaces/Pet";
import { UserType } from "@/types/enums/userType";
import useAuth from "@/hooks/useAuth";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function FavoriteClient() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageKeys, setPageKeys] = useState<Record<number, string | null>>({
    1: null,
  });

  const fetchFavorites = async (page: number) => {
    if (!authLoading && !user?.data?.id) {
      setError("You need to login to view your favorites");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get("/api/pets/favorites", {
        params: {
          shelterId: user?.data?.id,
          limit: 8,
          startAfterKey: pageKeys[page],
        },
      });

      if (response.data.status === "success") {
        const { pets, nextPageKey, totalPages } = response.data.data;
        setPets(pets);
        setTotalPages(totalPages);

        if (nextPageKey) {
          setPageKeys((prev) => ({
            ...prev,
            [page + 1]: nextPageKey,
          }));
        }
      } else {
        setError("Failed to load favorites");
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      setError("An error occurred while fetching your favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchFavorites(currentPage);
    }
  }, [authLoading, user?.data?.id, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFavoriteToggle = async (petId: string) => {
    if (!user?.data?.id) return;

    const pet = pets.find((p) => p.id === petId);
    if (!pet) return;
    const newStatus = !pet.isFavorite;

    setPets((prev) =>
      prev.map((p) => (p.id === petId ? { ...p, isFavorite: newStatus } : p)),
    );

    try {
      await axios.post("/api/pets/favorites", {
        shelterId: user.data.id,
        petId,
        isFavorite: newStatus,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Toggle favorite status failed:");
        console.error("  Status:", error.response?.status);
        console.error("  Response data:", error.response?.data);
      } else {
        console.error("Unexpected error:", error);
      }
      setPets((prev) =>
        prev.map((p) =>
          p.id === petId ? { ...p, isFavorite: pet.isFavorite } : p,
        ),
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Icon
          icon="mdi:loading"
          className="inline-block h-12 w-12 animate-spin"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-semibold">Error</h1>
        <p className="text-lg text-gray-600">{error}</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-semibold">No Favorites Yet</h1>
        <p className="text-lg text-gray-600">
          You haven&apos;t added any pets to your favorites list.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">My Favorite Pets</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            userType={UserType.SHELTER}
            onFavoriteClick={() => handleFavoriteToggle(pet.id)}
            onClick={() => console.log(`Adopt ${pet.name}`)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
