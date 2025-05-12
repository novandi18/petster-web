import { UserType } from "@/types/enums/userType";

export const NavbarMenu = {
  [UserType.GUEST]: [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Community", path: "/community" },
    { name: "Connect as Shelter", path: "/connect/shelter" },
    { name: "Connect as Volunteer", path: "/connect/volunteer" },
  ],
  [UserType.SHELTER]: [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Community", path: "/community" },
    { name: "Assistant", path: "/assistant" },
    { name: "Favorites", path: "/favorites" },
  ],
  [UserType.VOLUNTEER]: [
    { name: "Home", path: "/" },
    { name: "Your Pets", path: "/your_pets" },
    { name: "Community", path: "/community" },
  ],
} as const;
