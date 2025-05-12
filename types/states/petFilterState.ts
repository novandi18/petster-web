export type PetFilterState = {
  selectedAdoptionFeeRange?: string | null;
  selectedCategory?: string | null;
  selectedGender?: string | null;
  selectedVaccinated?: string | null;
  selectedSize?: string | null;
};

export const defaultPetFilterState: PetFilterState = {
  selectedAdoptionFeeRange: null,
  selectedCategory: null,
  selectedGender: null,
  selectedVaccinated: null,
  selectedSize: null,
};
