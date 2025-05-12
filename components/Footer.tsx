"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import GoogleDriveButton from "./buttons/GoogleDriveButton";

export default function Footer() {
  return (
    <footer className="bg-white py-8 text-black dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/">
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Petster Logo"
                  width={32}
                  height={32}
                />
                <span className="ml-2 text-lg font-semibold">Petster</span>
              </div>
            </Link>
            <p className="mt-2 text-sm">
              Giving Rescued Animals a Second Chance
            </p>
          </div>

          {/* Download & Social */}
          <div className="flex flex-col items-center space-y-4 md:items-end">
            <GoogleDriveButton href={process.env.APK_LINK ?? ""} />
            <div className="flex items-center space-x-4">
              <Link
                href="https://github.com/novandi18/petster"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-lime-500 dark:text-white"
              >
                <Icon icon="mdi:github" className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-800">
          <span className="text-sm">
            © {new Date().getFullYear()} Petster. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
