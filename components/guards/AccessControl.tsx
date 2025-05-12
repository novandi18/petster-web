"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserType } from "@/types/enums/userType";
import { PageAccess } from "@/config/PageAccess";
import useAuth from "@/hooks/useAuth";

// …existing imports…

export default function AccessControl({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const rule = PageAccess[pathname] ?? "ALL";

    const userType = user?.type ?? UserType.GUEST;
    const allowed =
      rule === "ALL" ||
      (Array.isArray(rule) && (rule as UserType[]).includes(userType));

    if (!allowed) {
      router.replace("/");
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}
