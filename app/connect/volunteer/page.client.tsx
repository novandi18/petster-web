"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/forms/LoginForm";
import useAuth from "@/hooks/useAuth";

export default function VolunteerLoginClient() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    const res = await login(data.email, data.password);
    setLoading(false);

    if ("error" in res) {
      setError(res.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-black dark:text-white">
          Volunteer Login
        </h1>
        <LoginForm
          onSubmit={handleLogin}
          className="flex flex-col gap-3"
          loading={loading}
          errorMessage={error ?? undefined}
        />
        <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          Don&apos;t have an account?{" "}
          <Link
            href="/connect/volunteer/register"
            className="text-lime-green font-medium hover:underline"
          >
            Register as Volunteer
          </Link>
        </p>
      </div>
    </div>
  );
}
