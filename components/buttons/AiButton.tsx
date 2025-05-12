"use client";

import { Icon } from "@iconify/react";

type AiButtonProps = {
  text: string;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export default function AiButton({
  text,
  onClick,
  isLoading = false,
  disabled = false,
}: AiButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#2669DB] to-[#1E8D6E] px-4 py-2 font-medium whitespace-nowrap text-white"
    >
      {isLoading ? (
        <Icon icon="mdi:loading" className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <Icon icon="mage:stars-b-fill" className="h-5 w-5" />
      )}
      {text}
    </button>
  );
}
