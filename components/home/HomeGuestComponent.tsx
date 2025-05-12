// components/HomeGuestComponent.tsx
import { AdoptReason } from "@/types/constants/adoptReasons";
import { Icon } from "@iconify/react";
import Link from "next/link";

const HomeGuestComponent = () => {
  return (
    <div className="grid grid-cols-1 space-y-12 md:grid-cols-2 md:gap-4">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">
          How can I help?
        </h2>
        <div className="space-y-4">
          <Link
            href="/connect/volunteer"
            className="flex items-center rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800"
          >
            <Icon
              icon="mdi:hand-heart"
              width="20"
              height="20"
              className="mr-2"
            />
            Shelter
          </Link>
          <Link
            href="/connect/shelter"
            className="flex items-center rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800"
          >
            <Icon icon="mdi:paw" width="20" height="20" className="mr-2" />
            Volunteer
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-lime-200 bg-lime-50 p-6 dark:border-lime-800 dark:bg-lime-950">
        <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">
          Why Adopt?
        </h2>
        <ul className="space-y-4">
          {AdoptReason.map((item, index) => (
            <li
              key={index}
              className="flex items-start space-x-3 text-black dark:text-white"
            >
              <Icon
                icon={item.icon}
                width="24"
                height="24"
                className="text-lime-500"
              />
              <p className="text-sm">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomeGuestComponent;
