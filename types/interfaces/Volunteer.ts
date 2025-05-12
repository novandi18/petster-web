import { VolunteerLocation } from "./VolunteerLocation";

export interface Volunteer {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  location?: VolunteerLocation;
}
