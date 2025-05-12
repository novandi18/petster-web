import { UserType } from "../enums/userType";
import { Pet } from "../interfaces/Pet";

export type PetCardProps = {
  pet?: Pet;
  userType: UserType;
  onFavoriteClick?: () => void;
  onClick?: () => void;
};
