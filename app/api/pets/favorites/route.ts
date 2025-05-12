import {
  getPetFavorites,
  toggleFavoritePet,
} from "@/lib/firestore/petFavoriteFirestore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shelterId = searchParams.get("shelterId");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  const startAfterKey = searchParams.get("startAfterKey") || undefined;

  if (!shelterId) {
    return NextResponse.json(
      { error: "shelterId is required" },
      { status: 400 },
    );
  }

  try {
    const result = await getPetFavorites(shelterId, limit, startAfterKey);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching pets:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { petId, shelterId, isFavorite } = await req.json();

  if (!petId || !shelterId) {
    return NextResponse.json(
      { error: "Pet ID and Shelter ID are required" },
      { status: 400 },
    );
  }

  try {
    const result = await toggleFavoritePet(petId, shelterId, isFavorite);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error toggling favorite pet:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Internal server error" },
      { status: 500 },
    );
  }
}
