"use client";

import { useState } from "react";
import Image from "next/image";
import ImageZoom from "./ImageZoom";
import { PetImage } from "@/types/interfaces/PetImage";

export type PetImageGalleryProps = {
  image: PetImage;
  initialSelectedIndex?: number;
  onSelect?: (url: string, index: number) => void;
  className?: string;
};

export default function PetImageGallery({
  image,
  initialSelectedIndex = 0,
  onSelect,
  className = "",
}: PetImageGalleryProps) {
  const { imageCoverUrl, imageUrls = [] } = image;
  const filtered = imageCoverUrl
    ? imageUrls.filter((u) => u !== imageCoverUrl)
    : imageUrls;
  const urls = imageCoverUrl ? [imageCoverUrl, ...filtered] : filtered;

  const safeIndex = Math.min(initialSelectedIndex, urls.length - 1);
  const [selected, setSelected] = useState(safeIndex);
  const mainUrl = urls[selected] || "";

  const handleSelect = (url: string, idx: number) => {
    setSelected(idx);
    onSelect?.(url, idx);
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg">
        <ImageZoom
          src={mainUrl}
          alt={`Pet image ${selected + 1}`}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex space-x-2 overflow-x-auto">
        {urls.map((url, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(url, idx)}
            className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
              idx === selected
                ? "border-lime-green"
                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <Image
              src={url}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
