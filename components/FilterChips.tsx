"use client";

import React from "react";

export type FilterChipsProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
  className?: string;
};

export default function FilterChips({
  label,
  options,
  selected,
  onChange,
  className = "",
}: FilterChipsProps) {
  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black ${className}`}
    >
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition ${
                isActive
                  ? "border-green-700 bg-green-500 text-white hover:bg-green-600"
                  : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
              } `}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
