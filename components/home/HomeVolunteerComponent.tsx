"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "@/hooks/useAuth";
import type { VolunteerDashboard } from "@/types/interfaces/VolunteerDashboard";
import Link from "next/link";

const HomeVolunteerComponent = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<VolunteerDashboard>({
    totalPets: 0,
    totalAdoptedPets: 0,
    totalPetsViewed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const volunteerId = String(user.data.id);

    axios
      .get<VolunteerDashboard>(`/api/dashboard?volunteerId=${volunteerId}`)
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load stats");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, user]);

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
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "Total Pets", value: stats.totalPets, icon: "mdi:dog-side" },
          {
            label: "Total Adopted",
            value: stats.totalAdoptedPets,
            icon: "mdi:heart",
          },
          { label: "Pet Views", value: stats.totalPetsViewed, icon: "mdi:eye" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="rounded-full bg-lime-500 p-3 text-white">
              <Icon icon={item.icon} width="24" height="24" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
              <p className="text-2xl font-semibold text-black dark:text-white">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between rounded-2xl border border-lime-200 bg-lime-50 p-6 sm:flex-row dark:border-lime-800 dark:bg-lime-950">
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
    </div>
  );
};

export default HomeVolunteerComponent;
