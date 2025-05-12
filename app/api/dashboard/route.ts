import { NextRequest, NextResponse } from "next/server";
import { getVolunteerDashboard } from "@/lib/firestore/petFirestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const volunteerId = searchParams.get("volunteerId");

  if (!volunteerId) {
    return NextResponse.json(
      { error: "volunteerId is required" },
      { status: 400 },
    );
  }

  try {
    const result = await getVolunteerDashboard(volunteerId);

    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: unknown) {
    console.error("Error fetching dashboard:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: msg || "Internal server error" },
      { status: 500 },
    );
  }
}
