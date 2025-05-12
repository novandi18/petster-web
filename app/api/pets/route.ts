import { getPets } from "@/lib/firestore/petFirestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const shelterId = searchParams.get("shelterId") || undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  const startAfter = searchParams.get("startAfter") || undefined;

  const filter = {
    selectedAdoptionFeeRange:
      searchParams.get("selectedAdoptionFeeRange") ||
      searchParams.get("adoptionFee") ||
      null,
    selectedCategory:
      searchParams.get("selectedCategory") ||
      searchParams.get("category") ||
      null,
    selectedGender:
      searchParams.get("selectedGender") || searchParams.get("gender") || null,
    selectedVaccinated:
      searchParams.get("selectedVaccinated") ||
      searchParams.get("vaccinated") ||
      null,
    selectedSize:
      searchParams.get("selectedSize") || searchParams.get("size") || null,
  };

  const shelterLocation = searchParams.get("shelterLocation");
  let location = undefined;
  if (shelterLocation) {
    const [latitude, longitude] = shelterLocation.split(",");
    location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
  }

  try {
    const { pets, nextPageKey, totalPages } = await getPets(
      limit,
      shelterId,
      startAfter,
      filter,
      location,
    );
    return NextResponse.json(
      { status: "success", data: { pets, nextPageKey, totalPages } },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error fetching pets:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Internal server error" },
      { status: 500 },
    );
  }
}
