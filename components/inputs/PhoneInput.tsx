"use client";

import React from "react";
import { Icon } from "@iconify/react";

export type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function PhoneInput({
  value,
  onChange,
  onBlur,
  error,
  placeholder = "085123456789",
  required = true,
  disabled = false,
  className = "",
}: PhoneInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Phone Number
      </label>
      <div className="relative mt-1">
        <Icon
          icon="mdi:phone-outline"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
        />
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          pattern="^^08[1-9][0-9]{6,12}$"
          disabled={disabled}
          className="focus:ring-lime-green dark:focus:ring-lime-green/50 block w-full rounded-xl border border-gray-300 py-2 pr-3 pl-10 focus:ring focus:outline-none disabled:bg-gray-300 sm:text-sm dark:border-gray-600 dark:bg-black dark:text-white dark:disabled:bg-gray-700"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
