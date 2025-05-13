"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import PetCard from "@/components/PetCard";
import Pagination from "@/components/Pagination";
import PetFilter from "@/components/PetFilter";
import { Pet } from "@/types/interfaces/Pet";
import { UserType } from "@/types/enums/userType";
import {
  defaultPetFilterState,
  PetFilterState,
} from "@/types/states/petFilterState";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function ExploreClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = 10;

  const getInitialFilters = () => {
    const initialFilters = { ...defaultPetFilterState };

    const category = searchParams.get("category");
    if (category) initialFilters.selectedCategory = category;

    const gender = searchParams.get("gender");
    if (gender) initialFilters.selectedGender = gender;

    const vaccinated = searchParams.get("vaccinated");
    if (vaccinated) initialFilters.selectedVaccinated = vaccinated;

    const size = searchParams.get("size");
    if (size) initialFilters.selectedSize = size;

    const adoptionFee = searchParams.get("adoptionFee");
    if (adoptionFee) initialFilters.selectedAdoptionFeeRange = adoptionFee;

    return initialFilters;
  };

  const [filters, setFilters] = useState<PetFilterState>(getInitialFilters());
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [pets, setPets] = useState<Pet[]>([]);
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [userType, setUserType] = useState<UserType>(UserType.GUEST);

  useEffect(() => {
    if (user?.data) {
      setUserType(user.type);
    } else {
      setUserType(UserType.GUEST);
    }
  }, [user]);

  const updateUrl = (newFilters: PetFilterState, page: number) => {
    const params = new URLSearchParams();

    if (newFilters.selectedCategory)
      params.set("category", newFilters.selectedCategory);

    if (newFilters.selectedGender)
      params.set("gender", newFilters.selectedGender);

    if (newFilters.selectedVaccinated)
      params.set("vaccinated", newFilters.selectedVaccinated);

    if (newFilters.selectedSize) params.set("size", newFilters.selectedSize);

    if (newFilters.selectedAdoptionFeeRange)
      params.set("adoptionFee", newFilters.selectedAdoptionFeeRange);

    if (page > 1) params.set("page", page.toString());

    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/pets", {
        params: {
          shelterId: user?.data?.id ?? null,
          limit: pageSize,
          page: currentPage,
          startAfter: currentPage > 1 ? nextPageKey : undefined,
          selectedCategory: filters.selectedCategory,
          selectedGender: filters.selectedGender,
          selectedVaccinated: filters.selectedVaccinated,
          selectedSize: filters.selectedSize,
          selectedAdoptionFeeRange: filters.selectedAdoptionFeeRange,
        },
      });
      const {
        data: { pets: fetched, nextPageKey: nextKey, totalPages: total },
      } = res.data;
      setPets(fetched);
      setNextPageKey(nextKey);
      setTotalPages(total || 1);
    } catch (err) {
      console.error("Failed to load pets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, user?.data, authLoading]);

  useEffect(() => {
    const newFilters = getInitialFilters();
    const newPage = parseInt(searchParams.get("page") || "1", 10);

    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFilters(newFilters);
    }

    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFavoriteToggle = async (petId: string, isFavorite: boolean) => {
    if (userType !== UserType.SHELTER || !user?.data?.id) {
      return;
    }

    const pet = pets.find((p) => p.id === petId);
    if (!pet) return;

    try {
      setPets((prevPets) =>
        prevPets.map((p) =>
          p.id === petId ? { ...p, isFavorite: !isFavorite } : p,
        ),
      );
      await axios.post(`/api/pets/favorites`, {
        shelterId: user!.data.id,
        petId,
        isFavorite: !isFavorite,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Toggle favorite status failed:");
        console.error("Status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      } else {
        console.error("Unexpected error:", error);
      }

      setPets((prevPets) =>
        prevPets.map((p) =>
          p.id === petId ? { ...p, isFavorite: !isFavorite } : p,
        ),
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <PetFilter
              filterState={filters}
              onFilterChange={(newState) => {
                setFilters(newState);
                setCurrentPage(1);
                updateUrl(newState, 1);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-2">
          {authLoading || loading ? (
            <div className="flex h-[70vh] items-center justify-center">
              <Icon
                icon="mdi:loading"
                className="inline-block h-12 w-12 animate-spin"
              />
            </div>
          ) : pets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Image
                src="/images/404.png"
                alt="No pets found"
                width={200}
                height={200}
                className="object-contain opacity-50"
              />
              <p className="text-center text-gray-500 dark:text-gray-400">
                No pets found.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-auto grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {pets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    userType={userType}
                    onFavoriteClick={() =>
                      handleFavoriteToggle(pet.id, pet.isFavorite)
                    }
                    onClick={() => router.push(`/pet/${pet.id}`)}
                  />
                ))}
              </div>
              <div className="mt-auto">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    updateUrl(filters, p);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
