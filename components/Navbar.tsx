"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { UserType } from "@/types/enums/userType";
import { DarkThemeToggle } from "flowbite-react";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { NavbarMenu } from "@/types/constants/navbarMenu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const userType = user?.type ?? UserType.GUEST;
  const menuItems = NavbarMenu[userType as keyof typeof NavbarMenu];
  const primaryItems = menuItems.filter((i) => !i.name.startsWith("Connect"));
  const connectItems = menuItems.filter((i) => i.name.startsWith("Connect"));

  const getIcon = (name: string) => {
    switch (name) {
      case "Home":
        return "mdi:home-outline";
      case "Explore":
        return "mdi:magnify";
      case "Community":
        return "mdi:account-group-outline";
      case "Connect as Shelter":
        return "mdi:home-heart-outline";
      case "Connect as Volunteer":
        return "mdi:hand-heart-outline";
      case "Assistant":
        return "mage:stars-b-fill";
      case "Favorites":
        return "mdi:heart-outline";
      case "Profile":
        return "mdi:account-circle-outline";
      case "Your Pets":
        return "mdi:paw-outline";
      default:
        return "mdi:circle";
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Brand */}
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Petster Logo"
                width={32}
                height={32}
              />
              <span className="ml-2 text-xl font-semibold text-black dark:text-white">
                Petster
              </span>
            </div>
          </Link>

          {/* Desktop Menu + Toggle + Mobile Hamburger */}
          <div className="flex items-center space-x-4">
            <div className="hidden space-x-4 md:flex">
              {primaryItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.name} href={item.path}>
                    <div
                      className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "text-lime-green"
                          : "text-black dark:text-white"
                      } hover:text-lime-green dark:hover:text-lime-green`}
                    >
                      <Icon
                        icon={getIcon(item.name)}
                        className="mr-2 h-5 w-5"
                      />
                      {item.name}
                    </div>
                  </Link>
                );
              })}

              {/* Connect dropdown */}
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserOpen((v) => !v)}
                      className="hover:text-lime-green dark:hover:text-lime-green flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium text-black dark:text-white"
                    >
                      <span className="mr-2">{user.data.name}</span>
                      <Icon icon="mdi:chevron-down" className="h-5 w-5" />
                    </button>
                    {isUserOpen && (
                      <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-black">
                        <Link href="/profile">
                          <div className="hover:bg-light-gray dark:hover:bg-dark-gray block px-4 py-2 text-sm text-black dark:text-white">
                            Profile
                          </div>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="hover:bg-light-gray dark:hover:bg-dark-gray block w-full cursor-pointer px-4 py-2 text-left text-sm text-black dark:text-white"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsUserOpen((v) => !v)}
                      className="hover:text-lime-green dark:hover:text-lime-green flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium text-black dark:text-white"
                    >
                      <Icon icon="mdi:account" className="h-5 w-5" />
                    </button>
                    {isUserOpen && (
                      <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-black">
                        {connectItems.map((item) => (
                          <Link key={item.name} href={item.path}>
                            <div className="hover:bg-light-gray dark:hover:bg-dark-gray block px-4 py-2 text-sm text-black dark:text-white">
                              {item.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <DarkThemeToggle className="cursor-pointer" />

            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="hover:text-lime-green dark:hover:text-lime-green inline-flex items-center justify-center rounded-md p-2 text-black focus:outline-none md:hidden dark:text-white"
            >
              {isOpen ? (
                <Icon icon="mdi:close" className="h-6 w-6" />
              ) : (
                <Icon icon="mdi:menu" className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="bg-white md:hidden dark:bg-black">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            {primaryItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path}>
                  <div
                    className={`flex items-center rounded-md px-3 py-2 text-base font-medium ${
                      isActive
                        ? "text-lime-green"
                        : "text-black dark:text-white"
                    } hover:text-lime-green dark:hover:text-lime-green`}
                  >
                    <Icon icon={getIcon(item.name)} className="mr-2 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}

            {/* Connect items expanded in mobile */}
            <div className="border-t border-gray-200 pt-2 dark:border-gray-800">
              {connectItems.map((item) => (
                <Link key={item.name} href={item.path}>
                  <div className="hover:text-lime-green dark:hover:text-lime-green rounded-md px-3 py-2 text-base font-medium text-black dark:text-white">
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
