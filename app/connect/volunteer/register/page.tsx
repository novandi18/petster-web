"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import VolunteerRegisterForm from "@/components/forms/VolunteerRegisterForm";
import useAuth from "@/hooks/useAuth";
import { UserType } from "@/types/enums/userType";

export default function VolunteerRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
  }) => {
    setError(null);
    setLoading(true);
    const res = await register({
      name: data.name,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      address: data.address,
      userType: UserType.VOLUNTEER,
    });
    setLoading(false);

    if (res.status === "error") {
      setError(res.error);
      return;
    }

    router.push("/connect/volunteer");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-black dark:text-white">
          Register as Volunteer
        </h1>
        <VolunteerRegisterForm
          onSubmit={handleRegister}
          className="flex flex-col gap-4"
          loading={loading}
          errorMessage={error ?? undefined}
        />
        <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          Already have an account?{" "}
          <Link
            href="/connect/volunteer"
            className="text-lime-green font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
