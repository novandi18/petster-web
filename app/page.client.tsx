"use client";

import HomeGuestComponent from "@/components/home/HomeGuestComponent";
import HomeShelterComponent from "@/components/home/HomeShelterComponent";
import HomeVolunteerComponent from "@/components/home/HomeVolunteerComponent";
import { useAlert } from "@/context/AlertContext";
import useAuth from "@/hooks/useAuth";
import { UserType } from "@/types/enums/userType";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function HomeClient() {
  const { user, loading } = useAuth();
  const { showAlert } = useAlert();

  const searchParams = useSearchParams();
  const emailChanged = searchParams.get("emailChanged");

  useEffect(() => {
    if (emailChanged === "true") {
      showAlert("Email successfully updated, please log in again", "success");
    }
  }, [emailChanged, showAlert]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-24 text-center text-gray-500 dark:text-gray-400">
        <Icon
          icon="mdi:loading"
          className="inline-block h-12 w-12 animate-spin"
        />
      </main>
    );
  }

  const userType = user?.type ?? UserType.GUEST;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {userType === UserType.VOLUNTEER && <HomeVolunteerComponent />}
      {userType === UserType.SHELTER && user && (
        <HomeShelterComponent shelterId={user.data.id} />
      )}
      {userType === UserType.GUEST && <HomeGuestComponent />}
    </div>
  );
}
