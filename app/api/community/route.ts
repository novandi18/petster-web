import {
  addPost,
  editPost,
  getCommunityPosts,
} from "@/lib/firestore/communityFirestore";
import { Post } from "@/types/interfaces/Post";
import { Response } from "@/types/interfaces/Response";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const startAfter = searchParams.get("startAfter") || null;
  const uuid = searchParams.get("uuid") || "";

  try {
    const resp = await getCommunityPosts(limit, startAfter, uuid);

    if (resp.status === "error" || !resp.data) {
      return NextResponse.json(Response.Error("Failed to fetch posts"), {
        status: 500,
      });
    }

    const { data, nextPageKey } = resp.data;

    return NextResponse.json(Response.Success({ data, nextPageKey }), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error fetching community posts:", error);
    return NextResponse.json(Response.Error("Failed to fetch posts"), {
      status: 500,
    });
  }
};

export async function POST(req: NextRequest) {
  try {
    const { authorId, authorType, content } = await req.json();

    if (!authorId || !authorType || !content) {
      return NextResponse.json(
        { error: "Missing required fields: authorId, authorType, or content" },
        { status: 400 },
      );
    }

    const newPost: Post = {
      authorId,
      authorType,
      content,
      createdAt: new Date(),
    };

    const result = await addPost(newPost);

    return NextResponse.json(
      {
        status: "success",
        message: "Post added successfully",
        postId: result.postId,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error adding post:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Failed to add post" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { postId, content } = await req.json();

    if (!postId || !content || content.trim() === "") {
      return NextResponse.json(
        { error: "Post ID and content cannot be empty" },
        { status: 400 },
      );
    }

    const result = await editPost(postId, content);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating post:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", error: message || "Internal server error" },
      { status: 500 },
    );
  }
}
