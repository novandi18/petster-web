"use client";

import React from "react";
import { Icon } from "@iconify/react";

export type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function PasswordInput({
  value,
  onChange,
  onBlur,
  error,
  placeholder = "••••••••",
  minLength = 6,
  required = true,
  disabled = false,
  className = "",
}: PasswordInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Password
      </label>
      <div className="relative mt-1">
        <Icon
          icon="mdi:lock-outline"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
        />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          minLength={minLength}
          required={required}
          disabled={disabled}
          className="focus:ring-lime-green block w-full rounded-xl border border-gray-300 py-2 pr-3 pl-10 focus:ring focus:outline-none disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 dark:border-gray-600 dark:bg-black dark:text-white"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
