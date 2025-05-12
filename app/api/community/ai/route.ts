import { generateAIContent } from "@/lib/ai/generateAI";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content, aiOption } = await req.json();

    if (!content || !aiOption) {
      return NextResponse.json(
        { error: "Missing required fields: content or aiOption" },
        { status: 400 },
      );
    }

    const improvedContent = await generateAIContent(content, aiOption);

    return NextResponse.json(
      {
        status: "success",
        message: "Content improved successfully",
        improvedContent: improvedContent,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error processing AI content:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Failed to process AI content" },
      { status: 500 },
    );
  }
}
