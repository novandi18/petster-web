import { Pet } from "./Pet";
import { Volunteer } from "./Volunteer";

export interface PetDetail {
  pet: Pet;
  volunteer?: Volunteer;
}
