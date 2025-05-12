import { PetImage } from "../interfaces/PetImage";

export type NewPet = {
  name: string;
  breed?: string;
  category: string;
  color: string;
  age: number;
  ageUnit: string;
  gender: string;
  weight: string;
  weightUnit: string;
  image: PetImage;
  behaviours?: string[];
  size: string;
  adoptionFee?: number;
  specialDiet?: string;
  disabilities?: string[];
  isVaccinated?: boolean;
};
