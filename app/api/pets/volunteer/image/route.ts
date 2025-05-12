import { uploadPetImage } from "@/lib/remote/imgbbRemoteSource";
import { Response } from "@/types/interfaces/Response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    const apiKey = process.env.IMGBB_API_KEY;

    if (!image || !apiKey) {
      return NextResponse.json(
        Response.Error("Missing image data or API key"),
        { status: 400 },
      );
    }

    const result = await uploadPetImage(image, apiKey);

    if (result.status === "success") {
      return NextResponse.json(
        Response.Success({ url: result.data.display_url }),
        { status: 200 },
      );
    } else {
      return NextResponse.json(Response.Error("Upload failed"), {
        status: 500,
      });
    }
  } catch (err) {
    console.error("Unexpected error in upload route:", err);
    return NextResponse.json(Response.Error("Internal server error"), {
      status: 500,
    });
  }
}
