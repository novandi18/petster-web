import { addComment, deleteComment } from "@/lib/firestore/communityFirestore";
import { NextRequest, NextResponse } from "next/server";

function getPostId(req: NextRequest) {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

export async function POST(req: NextRequest) {
  try {
    const postId = getPostId(req);
    const {
      authorId,
      authorType,
      comment: commentText,
      replyToCommentId,
    } = await req.json();

    if (!postId || !authorId || !authorType || !commentText) {
      return NextResponse.json(
        {
          status: "error",
          error:
            "Missing required fields: postId, authorId, authorType, or comment",
        },
        { status: 400 },
      );
    }

    const result = await addComment(postId, {
      authorId,
      authorType,
      comment: commentText,
      replyToCommentId,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Comment added successfully",
        commentId: result.commentId,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error adding comment:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Failed to add comment" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const postId = getPostId(req);
    const { commentId } = await req.json();

    if (!postId || !commentId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Missing required fields: postId or commentId",
        },
        { status: 400 },
      );
    }

    await deleteComment(postId, commentId);

    return NextResponse.json(
      {
        status: "success",
        message: "Comment deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error deleting comment:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Failed to delete comment" },
      { status: 500 },
    );
  }
}
