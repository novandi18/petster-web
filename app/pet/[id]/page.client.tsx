"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import PetImageGallery from "@/components/PetImageGallery";
import { UserType } from "@/types/enums/userType";
import useAuth from "@/hooks/useAuth";
import { Pet } from "@/types/interfaces/Pet";
import axios from "axios";
import { Volunteer } from "@/types/interfaces/Volunteer";
import { generateWhatsAppMessage } from "@/utils/whatsappUtil";
import { useAlert } from "@/context/AlertContext";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import Link from "next/link";

export default function PetClient({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const [pet, setPet] = useState<Pet | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>(UserType.GUEST);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isAdopted, setIsAdopted] = useState<boolean>(false);

  useEffect(() => {
    if (user?.data) {
      setUserType(user.type);
    } else {
      setUserType(UserType.GUEST);
    }
  }, [user]);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/pets/${id}`, {
          params: { shelterId: user?.data?.id },
        });

        const { pet: petData, volunteer: volunteerData } = response.data;

        setPet(petData);
        setVolunteer(volunteerData);
        setIsFavorite(petData.isFavorite || false);
        setIsAdopted(petData.adopted || false);

        if (user?.type === UserType.SHELTER && user?.data?.id) {
          axios
            .post(`/api/pets/${id}`, {
              shelterId: user.data.id,
            })
            .catch((err) => {
              console.error("Failed to record pet view:", err);
            });
        }
      } catch (err) {
        console.error("Failed to fetch pet:", err);
        if (axios.isAxiosError(err) && err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("Failed to load pet data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id, user?.data?.id, user?.type]);

  const handleFavoriteToggle = async () => {
    if (userType !== UserType.SHELTER || !user?.data?.id || !pet?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    try {
      await axios.post("/api/pets/favorites", {
        shelterId: user.data.id,
        petId: pet.id,
        isFavorite: newStatus,
      });
    } catch (err: unknown) {
      console.error("Toggle favorite status failed:", err);
      if (axios.isAxiosError(err)) {
        console.error("Status:", err.response?.status);
        console.error("Response data:", err.response?.data);
      }

      setIsFavorite(!newStatus);
    }
  };

  const handleAdoptClick = () => {
    if (!pet || !volunteer?.phoneNumber || !user?.data) return;

    const rawVolPhone = volunteer.phoneNumber.replace(/\D/g, "");
    const waVolPhone = rawVolPhone.startsWith("0")
      ? "62" + rawVolPhone.slice(1)
      : rawVolPhone;

    const shelterName = user.data.name;
    const message = generateWhatsAppMessage(
      pet.name,
      shelterName,
      volunteer.name,
      pet.category,
      pet.breed ?? "",
    );
    const encoded = encodeURIComponent(message);

    window.open(`https://wa.me/${waVolPhone}?text=${encoded}`, "_blank");
  };

  const handleToggleAdopted = async () => {
    if (!pet?.id) return;
    try {
      const res = await axios.patch("/api/pets/volunteer", {
        petId: pet.id,
        adopted: !isAdopted,
      });
      setIsAdopted(!isAdopted);
      showAlert(res.data.message, "success", "mdi:check-circle");
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to update status";
      showAlert(msg, "error", "mdi:alert-circle");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/pets/${id}`);
      showAlert("Pet deleted successfully", "success");
      router.push("/");
    } catch (err) {
      showAlert(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to delete pet",
        "error",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Icon
          icon="mdi:loading"
          className="inline-block h-12 w-12 animate-spin"
        />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white text-black dark:bg-black dark:text-white">
        <Image
          src="/images/404.png"
          alt="Pet not found"
          width={200}
          height={200}
          className="mb-4 opacity-50"
        />
        <h1 className="text-2xl font-semibold">{error || "Pet Not Found"}</h1>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="flex w-full flex-col items-center justify-center gap-0.5">
          <h1 className="text-center text-3xl font-bold text-black dark:text-white">
            {pet.name}
          </h1>
          {pet.viewCount !== undefined && pet.viewCount > 0 && (
            <div className="flex items-center gap-1">
              <Icon icon="mdi:eye" className="h-6 w-6" />
              <span className="text-sm">{pet.viewCount} views</span>
            </div>
          )}
        </div>

        {/* 1/3 image & buttons, 2/3 details */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Gallery */}
              <PetImageGallery
                image={pet.image}
                initialSelectedIndex={0}
                className="rounded-lg bg-white p-4 dark:bg-black"
              />

              {userType === UserType.SHELTER && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleAdoptClick}
                    className="bg-lime-green hover:bg-lime-green/90 inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-black"
                  >
                    <Icon icon="mdi:whatsapp" className="mr-2 h-5 w-5" />
                    Adopt
                  </button>
                  <button
                    onClick={handleFavoriteToggle}
                    className="bg-opacity-90 inline-flex cursor-pointer items-center rounded bg-white p-2 hover:text-red-500 dark:bg-black"
                  >
                    <Icon
                      icon={isFavorite ? "mdi:heart" : "mdi:heart-outline"}
                      className={`h-6 w-6 ${isFavorite ? "text-red-500" : ""}`}
                    />
                  </button>
                </div>
              )}

              {userType === UserType.VOLUNTEER && (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="inline-flex cursor-pointer items-center rounded-full bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                  >
                    <Icon icon="mdi:delete" className="h-5 w-5" />
                  </button>
                  <Link href={`/pet/${id}/edit`}>
                    <button className="inline-flex cursor-pointer items-center rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700">
                      <Icon icon="mdi:pencil" className="h-5 w-5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      if (pet.id) {
                        handleToggleAdopted();
                      }
                    }}
                    className="bg-lime-green hover:bg-lime-green/90 inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-black"
                  >
                    <Icon
                      icon={
                        isAdopted
                          ? "mdi:check-circle"
                          : "mdi:check-circle-outline"
                      }
                      className="mr-2 h-5 w-5"
                    />
                    {isAdopted ? "Set as Available" : "Set as Adopted"}
                  </button>
                </div>
              )}

              {userType === UserType.GUEST && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-3 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <Icon icon="mdi:alert-circle-outline" className="h-5 w-5" />
                  <p className="text-sm">
                    Please sign in as a shelter to proceed with pet adoption.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Pet Details */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
                Pet Information
              </h2>
              <dl className="grid grid-cols-1 gap-y-2 text-black dark:text-white">
                {pet.breed && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Breed:</dt>
                    <dd className="text-sm">{pet.breed}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">Category:</dt>
                  <dd className="text-sm">{pet.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">Age:</dt>
                  <dd className="text-sm">
                    {pet.age} {pet.ageUnit?.toLowerCase()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">Gender:</dt>
                  <dd className="text-sm">{pet.gender}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">Weight:</dt>
                  <dd className="text-sm">
                    {pet.weight} {pet.weightUnit}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">Color:</dt>
                  <dd className="text-sm">{pet.color}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">Size:</dt>
                  <dd className="text-sm">{pet.size}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">Adoption Fee:</dt>
                  <dd className="text-sm">
                    {pet.adoptionFee
                      ? `Rp ${pet.adoptionFee.toLocaleString("id-ID")}`
                      : "Free"}
                  </dd>
                </div>
                {pet.disabilities && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Disabilities:</dt>
                    <dd className="text-sm">{pet.disabilities}</dd>
                  </div>
                )}
                {pet.behaviours && (
                  <div>
                    <dt className="text-sm font-medium">Behaviors:</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {pet.behaviours.map((b) => (
                        <span
                          key={b}
                          className="inline-block rounded-xl bg-gray-200 px-3 py-2 text-sm dark:bg-gray-700"
                        >
                          {b}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {userType === UserType.SHELTER && volunteer && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
                <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
                  Volunteer Information
                </h2>
                <dl className="grid grid-cols-1 gap-y-2 text-black dark:text-white">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Name:</dt>
                    <dd className="text-sm">{volunteer.name}</dd>
                  </div>
                  {volunteer.email && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Email:</dt>
                      <dd className="text-sm">{volunteer.email}</dd>
                    </div>
                  )}
                  {volunteer.phoneNumber && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Phone Number:</dt>
                      <dd className="text-sm">{volunteer.phoneNumber}</dd>
                    </div>
                  )}
                  {volunteer.address && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Address:</dt>
                      <dd className="text-sm">{volunteer.address}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Pet?"
        description="This action cannot be undone. Are you sure you want to delete this pet?"
        icon="mdi:delete"
        confirmText="Yes, delete"
        confirmVariant="danger"
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await handleDelete();
          setDeleteModalOpen(false);
        }}
      />
    </>
  );
}
