"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { PetCardProps } from "@/types/components/PetCardProps";
import { UserType } from "@/types/enums/userType";
import clsx from "clsx";
import { sanitizeId } from "@/utils/appUtil";

export default function PetCard({
  pet,
  userType,
  onFavoriteClick,
  onClick,
}: PetCardProps) {
  if (!pet) return null;

  const {
    id,
    name,
    age,
    ageUnit,
    gender,
    viewCount = 0,
    image: { imageCoverUrl, imageUrls },
    isFavorite,
  } = pet;

  const safeId = sanitizeId(id);
  const href = `/pet/${safeId}`;

  const imageUrl = imageCoverUrl || imageUrls?.[0] || "";

  return (
    <Link href={href} className="relative block overflow-hidden rounded-3xl">
      <div className="relative aspect-[1/1.5] overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover object-center"
        />

        {viewCount > 0 && (
          <div className="bg-opacity-75 absolute top-2 left-2 flex items-center space-x-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-800 dark:bg-black dark:text-gray-200">
            <Icon icon="mdi:eye" className="h-4 w-4" />
            <span className="text-sm">{viewCount}</span>
          </div>
        )}

        {userType === UserType.SHELTER && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavoriteClick?.();
            }}
            className="bg-opacity-75 absolute top-2 right-2 rounded-full bg-white p-2 hover:text-red-500 dark:bg-black"
          >
            <Icon
              icon={isFavorite ? "mdi:heart" : "mdi:heart-outline"}
              className={clsx("h-6 w-6", isFavorite ? "text-red-500" : "")}
            />
          </button>
        )}
      </div>

      <div className="bg-lime-green absolute bottom-0 left-0 flex w-full justify-between p-3 text-black">
        <div>
          <h3 className="text-sm font-bold">{name}</h3>
          <p className="text-xs">
            {age} {ageUnit}, {gender}
          </p>
        </div>

        {userType === UserType.SHELTER && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onClick?.();
            }}
            className="rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Adopt
          </button>
        )}
      </div>
    </Link>
  );
}
