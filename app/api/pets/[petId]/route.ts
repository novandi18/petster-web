import {
  addPetView,
  deletePetById,
  getPetById,
  updatePet,
} from "@/lib/firestore/petFirestore";
import { PetDetail } from "@/types/interfaces/PetDetail";
import { Response } from "@/types/interfaces/Response";
import { NextRequest, NextResponse } from "next/server";

function extractPetId(req: NextRequest) {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

export async function GET(req: NextRequest) {
  const petId = extractPetId(req);
  const shelterId = new URL(req.url).searchParams.get("shelterId") ?? undefined;

  if (!petId) {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  const result: Response<PetDetail> = await getPetById(petId, shelterId);
  if (result.status === "success") {
    return NextResponse.json(result.data, { status: 200 });
  }
  return NextResponse.json(
    { error: result.status === "error" ? result.error : "Unexpected error" },
    { status: 400 },
  );
}

export async function DELETE(req: NextRequest) {
  const petId = extractPetId(req);
  if (!petId) {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  const result = await deletePetById(petId);
  if (result.status === "success") {
    return NextResponse.json({ message: result.data }, { status: 200 });
  }
  return NextResponse.json(
    { error: result.status === "error" ? result.error : "Unexpected error" },
    { status: 500 },
  );
}

export async function PATCH(req: NextRequest) {
  const petId = extractPetId(req);
  if (!petId) {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  const { volunteerId, ...data } = await req.json();
  if (!volunteerId) {
    return NextResponse.json(
      { error: "volunteerId is required" },
      { status: 400 },
    );
  }

  const result = await updatePet(volunteerId, petId, data);
  if (result.status === "success") {
    return NextResponse.json({ message: result.data }, { status: 200 });
  }
  return NextResponse.json(
    { error: result.status === "error" ? result.error : "Unexpected error" },
    { status: 500 },
  );
}

export async function POST(req: NextRequest) {
  const petId = extractPetId(req);
  if (!petId) {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  const { shelterId } = await req.json();
  if (!shelterId) {
    return NextResponse.json(
      { error: "shelterId is required" },
      { status: 400 },
    );
  }

  const result = await addPetView(petId, shelterId);
  if (result.status === "success") {
    return NextResponse.json({ message: result.data }, { status: 200 });
  }
  return NextResponse.json(
    { error: result.status === "error" ? result.error : "Unexpected error" },
    { status: 500 },
  );
}
