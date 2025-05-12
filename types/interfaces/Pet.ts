import { Timestamp } from "firebase/firestore";
import { PetImage } from "./PetImage";

export interface Pet {
  id: string;
  name: string;
  breed?: string | null;
  category: string;
  color: string;
  age: number;
  ageUnit: "Days" | "Weeks" | "Months" | "Years";
  gender: string;
  weight: string;
  weightUnit: "Kilogram" | "Gram" | "Ons" | "Pound";
  image: PetImage;
  behaviours: string[];
  size: "Small" | "Medium" | "Large";
  adoptionFee: number;
  specialDiet: string;
  disabilities?: string | null;
  isFavorite: boolean;
  isAdopted: boolean;
  isVaccinated: boolean;
  createdAt: Timestamp;
  volunteer: string;
  viewCount?: number;
}
