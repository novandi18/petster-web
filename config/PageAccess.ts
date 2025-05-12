import { UserType } from "@/types/enums/userType";

type PageAccessRule = {
  [path: string]: UserType[] | "ALL";
};

export const PageAccess: PageAccessRule = {
  "/": "ALL",
  "/explore": [UserType.GUEST, UserType.SHELTER],
  "/assistant": [UserType.SHELTER],
  "/profile": [UserType.SHELTER, UserType.VOLUNTEER],
  "/favorites": [UserType.SHELTER],
  "/your_pets": [UserType.VOLUNTEER],
  "/connect": [UserType.GUEST],
  "/connect/volunteer": [UserType.GUEST],
  "/connect/shelter": [UserType.GUEST],
  "/connect/volunteer/register": [UserType.GUEST],
  "/connect/shelter/register": [UserType.GUEST],
  "/pet/[petId]": "ALL",
  "/new_pet": [UserType.VOLUNTEER],
};
