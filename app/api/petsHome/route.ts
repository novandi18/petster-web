import { getPetsHome } from "@/lib/firestore/petFirestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shelterId = searchParams.get("shelterId");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 10;

  if (!shelterId) {
    return NextResponse.json(
      { error: "shelterId is required" },
      { status: 400 },
    );
  }

  try {
    const pets = await getPetsHome(shelterId, limit);
    return NextResponse.json(pets, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching pets:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Internal server error" },
      { status: 500 },
    );
  }
}
