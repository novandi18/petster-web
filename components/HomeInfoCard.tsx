"use client";

import Image from "next/image";
import CatHome from "@/public/images/cat_home.jpg";

export default function HomeInfoCard() {
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col">
        {/* Image */}
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={CatHome}
            alt="Adopt a furry friend"
            fill
            className="object-cover object-center"
          />
        </div>

        {/* Text Content */}
        <div className="w-full p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Want to Adopt a Furry Friend?
          </h2>
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
            Here are the quick steps:
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-gray-700 dark:text-gray-300">
            <li>Browse the pet listings and find the perfect match.</li>
            <li>View pet details and ask questions if needed.</li>
            <li>Follow the adoption process set by the shelter.</li>
            <li>Bring your new companion home!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
