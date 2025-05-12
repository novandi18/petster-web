import { ShelterLocation } from "@/types/interfaces/ShelterLocation";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Pet } from "@/types/interfaces/Pet";
import { Volunteer } from "@/types/interfaces/Volunteer";

export const applyGeofencing = async (
  pets: Pet[],
  shelterLocation: ShelterLocation,
  radiusKm: number,
) => {
  const petsWithDistance = await Promise.all(
    pets.map(async (pet) => {
      const volunteer = await getVolunteerForPet(pet.id);
      const volunteerLocation = volunteer?.location;

      if (volunteerLocation) {
        const distance = calculateDistanceKm(
          shelterLocation.latitude,
          shelterLocation.longitude,
          volunteerLocation.latitude!,
          volunteerLocation.longitude!,
        );

        if (distance <= radiusKm) {
          return { pet, distance };
        }
      }

      return null;
    }),
  );

  const validPets = petsWithDistance.filter((item) => item !== null) as {
    pet: Pet;
    distance: number;
  }[];

  return validPets
    .sort((a, b) => a.distance - b.distance)
    .map((item) => item.pet);
};

const getVolunteerForPet = async (petId: string) => {
  const volunteerSnapshot = await getDocs(
    query(collection(db, "volunteers"), where("petId", "==", petId)),
  );
  return volunteerSnapshot.docs.map((doc) => doc.data() as Volunteer)[0];
};

const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const earthRadiusKm = 6371;

  const toRadians = (degree: number) => degree * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};
