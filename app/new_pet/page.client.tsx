"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";

export default function NewPetClient() {
  const { user, loading: authLoading } = useAuth();
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
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadAllImages() {
    const uploaded: string[] = [];
    for (const imgBase64 of images) {
      try {
        const res = await axios.post("/api/pets/volunteer/image", {
          image: imgBase64,
        });
        uploaded.push(transformIbbUrl(res.data.data.url));
      } catch (err) {
        toast.showAlert("images failed to upload", "error");
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
      const urls = await uploadAllImages();

      const feeNumber = adoptionFee
        ? Number(adoptionFee.replace(/\D/g, ""))
        : null;

      const payload = {
        volunteerId: user.data.id,
        name,
        breed: breed || null,
        category,
        color,
        age: Number(age),
        ageUnit,
        gender,
        weight,
        weightUnit,
        image: {
          imageCoverUrl: urls[thumbnailIndex] || "",
          imageUrls: urls,
        },
        behaviours: behaviors.length > 0 ? behaviors : null,
        size,
        adoptionFee: feeNumber,
        specialDiet: specialDiet !== "None" ? specialDiet : null,
        disabilities: disabilities.length > 0 ? disabilities : null,
        isVaccinated,
      };

      await axios.post("/api/pets/volunteer", payload);

      toast.showAlert("Pet created successfully", "success");
      router.push("/your_pets");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.message)
        : "Failed to create pet";
      toast.showAlert(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-screen-md space-y-6 px-4 py-8"
    >
      <h1 className="text-2xl font-semibold">Create New Pet</h1>

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
          <Icon icon="mdi:check" className="mr-2" />
        )}
        Create Now
      </button>
    </form>
  );
}
