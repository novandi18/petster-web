"use client";

import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConnectClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-black">
      <h1 className="mb-4 text-4xl font-bold text-black dark:text-white">
        Account Connect
      </h1>
      <p className="mb-8 max-w-md text-center text-lg text-gray-700 dark:text-gray-300">
        Please choose how you&apos;d like to connect with our pet adoption and
        community.
      </p>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Link href="/connect/shelter">
          <div className="bg-lime-green hover:bg-lime-green/90 w-full rounded-md px-6 py-3 text-center text-black">
            Connect as Shelter
          </div>
        </Link>
        <Link href="/connect/volunteer">
          <div className="bg-lime-green hover:bg-lime-green/90 w-full rounded-md px-6 py-3 text-center text-black">
            Connect as Volunteer
          </div>
        </Link>
      </div>
    </div>
  );
}
