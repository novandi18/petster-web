"use client";

import { useRef, useEffect } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import { usePathname } from "next/navigation";

export default function TopLoadingBar({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<LoadingBarRef>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.continuousStart();
  }, [pathname]);

  useEffect(() => {
    ref.current?.complete();
  });

  return (
    <>
      <LoadingBar color="#32CD32" ref={ref} height={3} shadow={true} />
      {children}
    </>
  );
}
