import { NextRequest, NextResponse } from "next/server";
import { generateAssistantResponse } from "@/lib/ai/generateAI";
import {
  saveAssistantConversation,
  getAssistantHistoryByShelterId,
} from "@/lib/firestore/assistantFirestore";

export async function POST(req: NextRequest) {
  try {
    const { shelterId, question } = await req.json();
    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }
    const answer = await generateAssistantResponse(question);

    const saveResult = await saveAssistantConversation(
      shelterId,
      question,
      answer,
    );
    if (saveResult.status === "error") {
      console.error("Error saving assistant conversation:", saveResult.error);
    }

    return NextResponse.json({ message: answer }, { status: 200 });
  } catch (err: unknown) {
    console.error("Assistant API error:", err);
    return NextResponse.json(
      { error: "Failed to generate assistant response" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shelterId = searchParams.get("shelterId");

    if (!shelterId) {
      return NextResponse.json(
        { error: "shelterId is required" },
        { status: 400 },
      );
    }

    const result = await getAssistantHistoryByShelterId(shelterId);

    if (result.status === "success") {
      return NextResponse.json({ messages: result.data }, { status: 200 });
    } else {
      if (result.status === "error") {
        return NextResponse.json({ error: result.error }, { status: 500 });
      } else {
        return NextResponse.json(
          { error: "Unexpected status: loading" },
          { status: 500 },
        );
      }
    }
  } catch (err: unknown) {
    console.error("Error retrieving assistant history:", err);
    return NextResponse.json(
      { error: "Failed to retrieve assistant history" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { messageId, question } = await req.json();

    if (!messageId || !question) {
      return NextResponse.json(
        { error: "messageId and question are required" },
        { status: 400 },
      );
    }

    const newAnswer = await generateAssistantResponse(question);

    return NextResponse.json(
      {
        message: newAnswer,
        messageId,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Assistant retry error:", err);
    return NextResponse.json(
      { error: "Failed to retry assistant response" },
      { status: 500 },
    );
  }
}
