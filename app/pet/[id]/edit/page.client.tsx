"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import useAuth from "@/hooks/useAuth";
import MultiImageUploader from "@/components/MultiImageUploader";
import TextInput from "@/components/inputs/TextInput";
import FieldDropdown from "@/components/inputs/FieldDropdown";
import FilterChips from "@/components/FilterChips";
import {
  PET_AGE_UNITS,
  PET_BEHAVIORS,
  PET_CATEGORIES,
  PET_DISABILITIES,
  PET_GENDERS,
  PET_SIZES,
  PET_SPECIAL_DIETS,
  PET_WEIGHT_UNITS,
} from "@/types/constants/pet";
import { formatRupiah, transformIbbUrl } from "@/utils/postUtil";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { UpdatePet } from "@/types/interfaces/UpdatePet";

export default function EditPetClient() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const toast = useAlert();
  const router = useRouter();

  const specialDietOptions = ["None", ...PET_SPECIAL_DIETS];
  const [name, setName] = useState("");
  const [category, setCategory] = useState(PET_CATEGORIES[0]);
  const [age, setAge] = useState<string>("1");
  const [ageUnit, setAgeUnit] = useState(PET_AGE_UNITS[2]);
  const [gender, setGender] = useState(PET_GENDERS[0]);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [disabilities, setDisabilities] = useState<string[]>([]);
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState(PET_WEIGHT_UNITS[0]);
  const [size, setSize] = useState(PET_SIZES[0]);
  const [adoptionFee, setAdoptionFee] = useState<string>("");
  const [specialDiet, setSpecialDiet] = useState<string>("None");
  const [isVaccinated, setIsVaccinated] = useState(true);

  const [images, setImages] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);
  const [originalThumbnailIndex, setOriginalThumbnailIndex] =
    useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return;

      try {
        const response = await axios.get(`/api/pets/${id}`);
        const pet = response.data.pet;

        setName(pet.name || "");
        setCategory(pet.category || PET_CATEGORIES[0]);
        setAge(String(pet.age) || "1");
        setAgeUnit(pet.ageUnit || PET_AGE_UNITS[2]);
        setGender(pet.gender || PET_GENDERS[0]);
        setBehaviors(pet.behaviours || []);
        setDisabilities(pet.disabilities || []);
        setBreed(pet.breed || "");
        setColor(pet.color || "");
        setWeight(pet.weight || "");
        setWeightUnit(pet.weightUnit || PET_WEIGHT_UNITS[0]);
        setSize(pet.size || PET_SIZES[0]);
        setAdoptionFee(
          pet.adoptionFee ? formatRupiah(String(pet.adoptionFee)) : "",
        );
        setSpecialDiet(pet.specialDiet || "None");
        setIsVaccinated(pet.isVaccinated);

        if (pet.image && pet.image.imageUrls) {
          const urls = pet.image.imageUrls;
          setOriginalImages(urls);
          setImages(urls);

          const coverUrl = pet.image.imageCoverUrl;
          const idx = urls.findIndex((url: string) => url === coverUrl);
          setThumbnailIndex(idx >= 0 ? idx : 0);
          setOriginalThumbnailIndex(idx >= 0 ? idx : 0);
        }
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : "Failed to fetch pet";
        setError(msg);
        toast.showAlert(msg, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id, toast]);

  const imagesChanged = () => {
    if (images.length !== originalImages.length) return true;
    if (thumbnailIndex !== originalThumbnailIndex) return true;

    for (let i = 0; i < images.length; i++) {
      if (images[i] !== originalImages[i]) return true;
    }

    return false;
  };

  async function uploadAllImages() {
    const uploaded: string[] = [];
    for (const imgBase64 of images) {
      if (imgBase64.startsWith("http")) {
        uploaded.push(imgBase64);
        continue;
      }

      try {
        const res = await axios.post("/api/pets/volunteer/image", {
          image: imgBase64,
        });
        uploaded.push(transformIbbUrl(res.data.data.url));
      } catch (err) {
        toast.showAlert("Images failed to upload", "error");
        throw err;
      }
    }
    return uploaded;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (images.length === 0) {
      toast.showAlert("Please select at least one photo", "error");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const feeNumber = adoptionFee
        ? Number(adoptionFee.replace(/\D/g, ""))
        : undefined;

      const payload: UpdatePet = {
        name,
        breed: breed || undefined,
        category,
        color,
        age: Number(age),
        ageUnit,
        gender,
        weight,
        weightUnit,
        behaviours: behaviors.length > 0 ? behaviors : undefined,
        size,
        adoptionFee: feeNumber,
        specialDiet: specialDiet !== "None" ? specialDiet : undefined,
        disabilities: disabilities.length > 0 ? disabilities : undefined,
        isVaccinated,
      };

      if (imagesChanged()) {
        const urls = await uploadAllImages();
        payload.image = {
          imageCoverUrl: urls[thumbnailIndex] || "",
          imageUrls: urls,
        };
      }

      await axios.patch(`/api/pets/${id}`, {
        volunteerId: user.data.id,
        ...payload,
      });

      toast.showAlert("Pet updated successfully", "success");
      router.push("/your_pets");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.message)
        : "Failed to update pet";
      toast.showAlert(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon
          icon="mdi:loading"
          className="h-10 w-10 animate-spin text-lime-500"
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-screen-md space-y-6 px-4 py-8"
    >
      <h1 className="text-2xl font-semibold">Edit Pet</h1>

      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="space-y-4">
        <TextInput label="Name" value={name} onChange={setName} required />

        <div className="grid grid-cols-2 gap-4">
          <FieldDropdown
            label="Category"
            options={PET_CATEGORIES}
            value={category}
            onChange={setCategory}
            required
          />

          <div className="flex space-x-4">
            <TextInput
              label="Age"
              value={age}
              onChange={(v) => setAge(v.replace(/\D/, ""))}
              required
              className="flex-1"
            />
            <FieldDropdown
              label="Unit"
              options={PET_AGE_UNITS}
              value={ageUnit}
              onChange={setAgeUnit}
              required
              className="w-1/3"
            />
          </div>
        </div>

        <div className="flex justify-between space-x-4">
          <TextInput
            className="flex-1"
            label="Breed"
            value={breed}
            onChange={setBreed}
          />

          <TextInput
            className="flex-1"
            label="Color"
            value={color}
            onChange={setColor}
            required
          />
        </div>

        <div>
          <TextInput
            label="Adoption Fee (Rupiah)"
            value={adoptionFee}
            onChange={(v) => {
              const numeric = v.replace(/\D/g, "").replace(/^0+/, "");
              setAdoptionFee(formatRupiah(numeric));
            }}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            If the adoption fee is free, leave this field blank.
          </p>
        </div>

        <div className="flex space-x-4">
          <TextInput
            label="Weight"
            value={weight}
            onChange={(v) => setWeight(v.replace(/[^0-9.]/g, ""))}
            required
            className="flex-1"
          />
          <FieldDropdown
            label="Weight Unit"
            options={PET_WEIGHT_UNITS}
            value={weightUnit}
            onChange={setWeightUnit}
            required
            className="w-1/3"
          />
        </div>

        <div className="flex justify-between space-x-4">
          <FieldDropdown
            className="flex-1"
            label="Size"
            options={PET_SIZES}
            value={size}
            onChange={setSize}
            required
          />

          <FieldDropdown
            className="flex-1"
            label="Gender"
            options={PET_GENDERS}
            value={gender}
            onChange={setGender}
            required
          />
        </div>

        <div className="flex justify-between space-x-4">
          <FieldDropdown
            className="flex-1"
            label="Special Diet"
            options={specialDietOptions}
            value={specialDiet}
            onChange={setSpecialDiet}
          />

          <FieldDropdown
            className="flex-1"
            label="Vaccinated"
            options={["Yes", "No"]}
            value={isVaccinated ? "Yes" : "No"}
            onChange={(v) => setIsVaccinated(v === "Yes")}
            required
          />
        </div>

        <FilterChips
          label="Behaviors"
          options={PET_BEHAVIORS}
          selected={behaviors}
          onChange={setBehaviors}
        />

        <FilterChips
          label="Disabilities"
          options={PET_DISABILITIES}
          selected={disabilities}
          onChange={setDisabilities}
        />
      </div>

      <div className="mb-8">
        <span className="block font-medium">
          Photos<span className="ml-1 text-red-500">*</span>
        </span>
        <span className="mb-3 block text-sm text-gray-400">Max. 5 photos</span>
        <MultiImageUploader
          images={images}
          onChange={setImages}
          maxCount={5}
          thumbnailIndex={thumbnailIndex}
          onThumbnailChange={setThumbnailIndex}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex cursor-pointer items-center rounded-xl bg-lime-500 px-5 py-3 font-medium text-white transition hover:bg-lime-600 disabled:cursor-default disabled:bg-lime-600 dark:text-black"
      >
        {submitting ? (
          <Icon icon="mdi:loading" className="mr-2 animate-spin" />
        ) : (
          <Icon icon="mdi:pencil" className="mr-2" />
        )}
        Update Pet
      </button>
    </form>
  );
}
