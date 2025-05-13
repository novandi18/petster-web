"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "@/hooks/useAuth";
import PetCard from "@/components/PetCard";
import Pagination from "@/components/Pagination";
import { UserType } from "@/types/enums/userType";
import type { Pet } from "@/types/interfaces/Pet";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

export function YourPetsClient() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageKeys, setPageKeys] = useState<(string | undefined)[]>([undefined]);
  const limitCount = 10;

  useEffect(() => {
    if (authLoading || !user) return;

    const startAfterKey = pageKeys[currentPage - 1];
    setLoading(true);
    setError(null);

    axios
      .get<{
        pets: Pet[];
        nextPageKey: string | null;
        totalPages: number;
      }>(`/api/pets/volunteer`, {
        params: {
          volunteerId: user.data.id,
          limit: limitCount,
          startAfterKey,
        },
      })
      .then((res) => {
        setPets(res.data.pets);
        setTotalPages(res.data.totalPages);
        setPageKeys((keys) => {
          const next = [...keys];
          next[currentPage] = res.data.nextPageKey ?? undefined;
          return next;
        });
      })
      .catch(() => {
        setError("Failed to load your pets");
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, currentPage]);

  if (authLoading || loading) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center">
        <Icon
          icon="mdi:loading"
          className="animate-spin text-4xl text-gray-500 dark:text-gray-400"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-6">
      <div className="dark:bg-dark-900 mb-8 flex flex-col items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:flex-row dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 sm:mb-0">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Got a pet that needs a loving home?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Post it here!</p>
        </div>
        <Link
          href="/new_pet"
          className="inline-flex cursor-pointer items-center rounded-xl bg-lime-500 px-5 py-3 font-medium text-white transition hover:bg-lime-600 dark:text-black"
        >
          <Icon icon="mdi:plus-box" width="20" height="20" className="mr-2" />
          Create Post
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {pets.map((p) => (
          <PetCard key={p.id} pet={p} userType={UserType.VOLUNTEER} />
        ))}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) =>
            page >= 1 && page <= totalPages && setCurrentPage(page)
          }
        />
      </div>
    </div>
  );
}
