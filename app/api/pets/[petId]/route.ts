import {
  addPetView,
  deletePetById,
  getPetById,
  updatePet,
} from "@/lib/firestore/petFirestore";
import { PetDetail } from "@/types/interfaces/PetDetail";
import { Response } from "@/types/interfaces/Response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { petId: string } },
) {
  const { petId } = await params;
  const { searchParams } = new URL(req.url);

  const shelterId = searchParams.get("shelterId") || undefined;

  const result: Response<PetDetail> = await getPetById(petId, shelterId);

  if (result.status === "success") {
    return NextResponse.json(result.data, { status: 200 });
  } else if (result.status === "error") {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ error: "Unknown error" }, { status: 500 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { petId: string } },
) {
  const { petId } = params;
  if (!petId) {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  try {
    const result = await deletePetById(petId);
    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ message: result.data }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: msg || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { petId: string } },
) {
  const { petId } = params;
  if (!petId) {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { volunteerId, ...data } = body;
    if (!volunteerId) {
      return NextResponse.json(
        { error: "volunteerId is required" },
        { status: 400 },
      );
    }

    const result = await updatePet(volunteerId, petId, data);
    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ message: result.data }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { petId: string } },
) {
  const { petId } = params;
  if (!petId) {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { shelterId } = body;

    if (!shelterId) {
      return NextResponse.json(
        { error: "shelterId is required" },
        { status: 400 },
      );
    }

    const result = await addPetView(petId, shelterId);

    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: result.data }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
