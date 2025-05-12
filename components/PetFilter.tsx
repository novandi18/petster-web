"use client";

import React, { useEffect, useState } from "react";
import { petFilterOptions } from "@/types/constants/petFilterOptions";
import { PetFilterState } from "@/types/states/petFilterState";

export type PetFilterProps = {
  filterState: PetFilterState;
  onFilterChange: (newState: PetFilterState) => void;
};

export default function PetFilter({
  filterState,
  onFilterChange,
}: PetFilterProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelect = (key: keyof PetFilterState, value: string) => {
    const current = filterState[key];
    onFilterChange({
      ...filterState,
      [key]: current === value ? null : value,
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
        Filter Pets
      </h3>

      {/* Adoption Fee Range */}
      <section className="mb-4">
        <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-300">
          Adoption Fee
        </h4>
        <div className="flex flex-wrap gap-2">
          {petFilterOptions.adoptionFeeRanges.map((opt) => (
            <label
              key={opt}
              className={`flex cursor-pointer items-center rounded border px-3 py-1 ${
                filterState.selectedAdoptionFeeRange === opt
                  ? "border-lime-green bg-lime-green text-black"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              <input
                type="checkbox" // Checkbox allows toggle selection
                checked={filterState.selectedAdoptionFeeRange === opt}
                onChange={() => handleSelect("selectedAdoptionFeeRange", opt)}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      </section>

      {/* Category */}
      <section className="mb-4">
        <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-300">
          Category
        </h4>
        <div className="flex flex-wrap gap-2">
          {petFilterOptions.categories.map((opt) => (
            <label
              key={opt}
              className={`flex cursor-pointer items-center rounded border px-3 py-1 ${
                filterState.selectedCategory === opt
                  ? "border-lime-green bg-lime-green text-black"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              <input
                type="checkbox" // Checkbox allows toggle selection
                checked={filterState.selectedCategory === opt}
                onChange={() => handleSelect("selectedCategory", opt)}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      </section>

      {/* Gender */}
      <section className="mb-4">
        <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-300">
          Gender
        </h4>
        <div className="flex flex-wrap gap-2">
          {petFilterOptions.genders.map((opt) => (
            <label
              key={opt}
              className={`flex cursor-pointer items-center rounded border px-3 py-1 ${
                filterState.selectedGender === opt
                  ? "border-lime-green bg-lime-green text-black"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              <input
                type="checkbox" // Checkbox allows toggle selection
                checked={filterState.selectedGender === opt}
                onChange={() => handleSelect("selectedGender", opt)}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      </section>

      {/* Vaccinated */}
      <section className="mb-4">
        <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-300">
          Vaccinated
        </h4>
        <div className="flex flex-wrap gap-2">
          {petFilterOptions.vaccinated.map((opt) => (
            <label
              key={opt}
              className={`flex cursor-pointer items-center rounded border px-3 py-1 ${
                filterState.selectedVaccinated === opt
                  ? "border-lime-green bg-lime-green text-black"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              <input
                type="checkbox" // Checkbox allows toggle selection
                checked={filterState.selectedVaccinated === opt}
                onChange={() => handleSelect("selectedVaccinated", opt)}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      </section>

      {/* Size */}
      <section>
        <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-300">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {petFilterOptions.sizes.map((opt) => (
            <label
              key={opt}
              className={`flex cursor-pointer items-center rounded border px-3 py-1 ${
                filterState.selectedSize === opt
                  ? "border-lime-green bg-lime-green text-black"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={filterState.selectedSize === opt}
                onChange={() => handleSelect("selectedSize", opt)}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
