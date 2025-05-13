/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

export interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxCount?: number;
  thumbnailIndex?: number;
  onThumbnailChange?: (index: number) => void;
}

export default function MultiImageUploader({
  images,
  onChange,
  maxCount = 5,
  thumbnailIndex,
  onThumbnailChange,
}: MultiImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList, replaceIndex?: number) => {
    const toRead = Array.from(files).slice(0, maxCount - images.length);

    const readers = toRead.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => {
            if (typeof fr.result === "string") resolve(fr.result);
            else reject(new Error("Failed to read file"));
          };
          fr.onerror = () => reject(new Error("FileReader error"));
          fr.readAsDataURL(file);
        }),
    );

    Promise.all(readers)
      .then((dataUrls) => {
        const updated = [...images];
        if (replaceIndex != null) {
          updated[replaceIndex] = dataUrls[0];
        } else {
          updated.push(...dataUrls);
        }
        onChange(updated.slice(0, maxCount));
      })
      .catch((err) => {
        console.error("Error reading files:", err);
      });
  };

  const triggerSelect = (replaceIndex?: number) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) handleFiles(files, replaceIndex);
      (e.target as HTMLInputElement).value = "";
    };
    fileInputRef.current.click();
  };

  const handleDelete = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange(updated);
  };

  const handleSetThumbnail = (idx: number) => {
    onThumbnailChange?.(idx);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
          >
            <img
              src={src}
              alt={`upload-${idx}`}
              className="h-full w-full object-cover object-center"
            />
            <div className="bg-opacity-0 group-hover:bg-opacity-30 absolute inset-0 transition" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
              {idx !== thumbnailIndex && (
                <button
                  onClick={() => handleSetThumbnail(idx)}
                  className="mx-1 cursor-pointer rounded-full bg-white p-2 hover:bg-gray-200"
                  title="Set as thumbnail"
                >
                  <Icon
                    icon="mdi:star"
                    className="text-yellow-500"
                    width="20"
                    height="20"
                  />
                </button>
              )}
              <button
                onClick={() => triggerSelect(idx)}
                className="mx-1 cursor-pointer rounded-full bg-white p-2 hover:bg-gray-200"
                title="Replace image"
              >
                <Icon
                  icon="mdi:refresh"
                  width="20"
                  height="20"
                  className="text-black"
                />
              </button>
              <button
                onClick={() => handleDelete(idx)}
                className="mx-1 cursor-pointer rounded-full bg-white p-2 hover:bg-gray-200"
                title="Delete image"
              >
                <Icon
                  icon="mdi:delete"
                  width="20"
                  height="20"
                  className="text-black"
                />
              </button>
            </div>
            {thumbnailIndex === idx && (
              <div className="absolute top-2 left-2 rounded-full bg-white p-1">
                <Icon
                  icon="mdi:check-circle"
                  className="text-green-600"
                  width="16"
                  height="16"
                />
              </div>
            )}
          </div>
        ))}

        {images.length < maxCount && (
          <div
            onClick={() => triggerSelect()}
            className="flex aspect-[3/4] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-400 text-gray-400 hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            <Icon icon="mdi:plus" width="36" height="36" />
          </div>
        )}
      </div>
    </>
  );
}
