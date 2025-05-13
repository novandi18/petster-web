import { NextRequest, NextResponse } from "next/server";
import {
  deletePost,
  getPostById,
  togglePostLike,
} from "@/lib/firestore/communityFirestore";

function extractPostId(req: NextRequest) {
  const pathname = new URL(req.url).pathname;
  const segments = pathname.split("/");
  return segments[3];
}

export async function GET(req: NextRequest) {
  try {
    const postId = extractPostId(req);
    const currentUserId =
      new URL(req.url).searchParams.get("currentUserId") || undefined;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    const result = await getPostById(postId, currentUserId);
    if (result.status === "error") {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching post by id:", error);
    return NextResponse.json(
      { error: "Failed to fetch post details" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
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
  } catch (error) {
    console.error("Error toggling post like:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const postId = extractPostId(req);
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }
    const result = await deletePost(postId);
    if (!result.message) {
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Internal server error" },
      { status: 500 },
    );
  }
}
