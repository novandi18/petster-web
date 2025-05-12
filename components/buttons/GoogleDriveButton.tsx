import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface GoogleDriveButtonProps {
  href: string;
  className?: string;
}

export default function GoogleDriveButton({
  href,
  className = "",
}: GoogleDriveButtonProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-lg bg-black px-4 py-3 text-white transition-all hover:bg-gray-900 ${className}`}
    >
      <Icon icon="logos:google-drive" className="h-8 w-8" />
      <div className="flex flex-col">
        <span className="text-xs font-medium">Download APK from</span>
        <span className="text-xl leading-tight font-semibold">
          Google Drive
        </span>
      </div>
    </Link>
  );
}
