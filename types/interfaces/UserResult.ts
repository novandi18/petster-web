import { UserType } from "../enums/userType";
import { Shelter } from "./Shelter";
import { Volunteer } from "./Volunteer";

export interface VolunteerUser {
  type: UserType.VOLUNTEER;
  data: Volunteer;
}

export interface ShelterUser {
  type: UserType.SHELTER;
  data: Shelter;
}

export type UserResult = VolunteerUser | ShelterUser;
