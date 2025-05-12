"use client";

import { useState } from "react";
import { PetHome } from "@/types/interfaces/PetHome";
import { UserType } from "@/types/enums/userType";
import PetCard from "@/components/PetCard";

type HomePetListProps = {
  petHome: PetHome;
  userType: UserType;
  onFavoriteClick: (petId: string) => void;
  onClick: (petId: string) => void;
};

export default function HomePetList({
  petHome,
  userType,
  onFavoriteClick,
  onClick,
}: HomePetListProps) {
  const categories = ["All", "Dog", "Cat", "Other"] as const;
  type Cat = (typeof categories)[number];
  const [selected, setSelected] = useState<Cat>("All");

  const getPets = () => {
    const { dog = [], cat = [], other = [] } = petHome;

    if (selected === "All") {
      return [...dog, ...cat, ...other];
    }
    const key = selected.toLowerCase() as keyof PetHome;
    const list = petHome[key];
    return Array.isArray(list) ? list : [];
  };

  const pets = getPets();

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-6 flex space-x-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selected === cat
                ? "bg-lime-green border-lime-green border text-black"
                : "hover:bg-lime-green hover:border-lime-green border border-black bg-transparent text-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:text-black"
            } `}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            userType={userType}
            onFavoriteClick={() => onFavoriteClick(pet.id)}
            onClick={() => onClick(pet.id)}
          />
        ))}
      </div>
    </section>
  );
}
