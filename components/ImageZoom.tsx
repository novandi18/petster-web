"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

type ImageZoomProps = {
  src: string;
  alt?: string;
  className?: string;
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function ImageZoom({
  src,
  alt = "",
  className = "",
  maxZoom = 5,
  minZoom = 1,
  zoomStep = 0.5,
}: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const zoomIn = () => {
    setScale((s) => clamp(s + zoomStep, minZoom, maxZoom));
  };

  const zoomOut = () => {
    setScale((s) => clamp(s - zoomStep, minZoom, maxZoom));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const close = () => {
    setIsOpen(false);
    setScale(1);
  };

  return (
    <>
      <Image
        src={src}
        alt={alt}
        className={`cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
        fill
      />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <button
            onClick={close}
            className="fixed top-20 right-4 z-10 cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <Icon icon="mdi:close" className="h-5 w-5" />
          </button>

          <div className="absolute bottom-8 z-10">
            <button
              onClick={zoomOut}
              className="cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <Icon icon="mdi:magnify-minus" className="h-5 w-5" />
            </button>

            <button
              onClick={zoomIn}
              className="mx-2 cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <Icon icon="mdi:magnify-plus" className="h-5 w-5" />
            </button>
            <button
              onClick={resetZoom}
              className="cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <Icon icon="mdi:restore" className="h-5 w-5" />
            </button>
          </div>

          <Image
            src={src}
            alt={alt}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
            width={500}
            height={500}
            className="max-h-[80vh] max-w-[80vw] rounded-md object-contain"
          />
        </div>
      )}
    </>
  );
}
