import {
  deletePost,
  getPostById,
  togglePostLike,
} from "@/lib/firestore/communityFirestore";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const { postId } = params;
  const { searchParams } = new URL(req.url);
  const currentUserId = searchParams.get("currentUserId") || undefined;

  console.log("API Handler - postId:", postId);
  console.log("API Handler - currentUserId:", currentUserId);

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const result = await getPostById(postId, currentUserId);
    console.log("getPostById result:", result);

    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching post by id:", error);
    return NextResponse.json(
      { error: "Failed to fetch post details" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { postId, userId, isLike } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "Post ID and User ID are required" },
        { status: 400 },
      );
    }

    const result = await togglePostLike(postId, userId, isLike);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error toggling post like:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const { postId } = params;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    const result = await deletePost(postId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Internal server error" },
      { status: 500 },
    );
  }
}
