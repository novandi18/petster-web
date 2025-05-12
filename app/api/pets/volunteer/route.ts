import { NextRequest, NextResponse } from "next/server";
import {
  addPet,
  getPetsByVolunteer,
  togglePetAdopted,
} from "@/lib/firestore/petFirestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const volunteerId = searchParams.get("volunteerId");
  if (!volunteerId) {
    return NextResponse.json(
      { error: "volunteerId is required" },
      { status: 400 },
    );
  }

  const limitParam = searchParams.get("limit");
  const limitCount = limitParam ? parseInt(limitParam, 10) : 10;
  const startAfterKey = searchParams.get("startAfterKey") ?? undefined;

  try {
    const result = await getPetsByVolunteer(
      volunteerId,
      limitCount,
      startAfterKey,
    );
    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result.data, { status: 200 });
  } catch (err: unknown) {
    console.error("Error fetching volunteer pets:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: msg || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { petId, adopted } = await req.json();
    if (!petId || typeof adopted !== "boolean") {
      return NextResponse.json(
        { error: "petId (string) and adopted (boolean) are required" },
        { status: 400 },
      );
    }

    const result = await togglePetAdopted(petId, adopted);
    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: result.data }, { status: 200 });
  } catch (err: unknown) {
    console.error("Error toggling pet adopted status:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: msg || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { volunteerId, ...petData } = body;
    if (!volunteerId || typeof volunteerId !== "string") {
      return NextResponse.json(
        { error: "volunteerId is required" },
        { status: 400 },
      );
    }
    const result = await addPet(volunteerId, petData);
    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ petId: result.data }, { status: 201 });
  } catch (err: unknown) {
    console.error("Error creating pet:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: msg || "Internal server error" },
      { status: 500 },
    );
  }
}
