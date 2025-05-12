import {
  Post,
  PostComment,
  PostLike,
  PostResult,
} from "@/types/interfaces/Post";
import { Response } from "@/types/interfaces/Response";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { UserResult } from "@/types/interfaces/UserResult";
import { UserType } from "@/types/enums/userType";
import { Volunteer } from "@/types/interfaces/Volunteer";
import { Shelter } from "@/types/interfaces/Shelter";

export const getCommunityPosts = async (
  limitCount: number,
  startAfterKey: string | null,
  uuid: string,
): Promise<Response<{ data: PostResult[]; nextPageKey: string | null }>> => {
  try {
    let postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );

    if (startAfterKey) {
      const startDoc = await getDoc(doc(db, "posts", startAfterKey));
      if (startDoc.exists()) {
        postsQuery = query(postsQuery, startAfter(startDoc));
      }
    }

    const querySnapshot = await getDocs(postsQuery);
    const posts = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      authorId: doc.data().authorId || null,
      authorName: doc.data().authorName || null,
      authorType: doc.data().authorType || null,
    }));

    const postResults: PostResult[] = [];
    for (const post of posts) {
      const postId = post.id;
      const likesSnapshot = await getDocs(
        collection(db, "posts", postId, "likes"),
      );
      const commentsSnapshot = await getDocs(
        collection(db, "posts", postId, "comments"),
      );

      const likeCount = likesSnapshot.size;
      const commentCount = commentsSnapshot.size;
      const isLiked = likesSnapshot.docs.some((doc) => doc.id === uuid);

      let postAuthor: UserResult | null = null;
      if (post.authorId && post.authorType) {
        const collectionName =
          post.authorType === "volunteer" ? "volunteers" : "shelters";

        const authorRef = doc(db, collectionName, post.authorId);
        const authorSnap = await getDoc(authorRef);

        if (authorSnap.exists()) {
          postAuthor = {
            type:
              post.authorType === "volunteer"
                ? UserType.VOLUNTEER
                : UserType.SHELTER,
            data:
              post.authorType === "volunteer"
                ? (authorSnap.data() as Volunteer)
                : (authorSnap.data() as Shelter),
          };
        }
      }

      postResults.push({
        posts: { ...post, author: postAuthor ?? undefined },
        likeCount,
        commentCount,
        isLiked,
      });
    }

    const lastVisible =
      querySnapshot.docs[querySnapshot.docs.length - 1]?.id || null;
    return Response.Success({
      data: postResults,
      nextPageKey: lastVisible,
    });
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return Response.Error("Error fetching posts");
  }
};

export const getPostById = async (
  postId: string,
  currentUserId?: string,
): Promise<Response<PostResult>> => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      return Response.Error("Post not found");
    }

    const post = postSnapshot.data() as Post;
    post.id = postSnapshot.id;

    const commentsQuery = query(
      collection(postRef, "comments"),
      orderBy("createdAt", "asc"),
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = commentsSnapshot.docs.map((doc) => {
      const commentData = doc.data() as PostComment;
      return {
        ...commentData,
        id: doc.id,
      };
    });

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        let commentAuthor: UserResult | null = null;
        if (comment.authorId && comment.authorType) {
          const collectionName =
            comment.authorType === "volunteer" ? "volunteers" : "shelters";
          const authorRef = doc(db, collectionName, comment.authorId);
          const authorDoc = await getDoc(authorRef);

          if (authorDoc.exists()) {
            commentAuthor =
              comment.authorType === "volunteer"
                ? {
                    type: UserType.VOLUNTEER,
                    data: authorDoc.data() as Volunteer,
                  }
                : { type: UserType.SHELTER, data: authorDoc.data() as Shelter };
          }
        }
        return { ...comment, author: commentAuthor ?? undefined };
      }),
    );

    const likesSnapshot = await getDocs(collection(postRef, "likes"));
    const likes = likesSnapshot.docs.map((doc) => doc.data() as PostLike);
    const isLiked = currentUserId
      ? likesSnapshot.docs.some((doc) => doc.id === currentUserId)
      : false;

    let postAuthor: UserResult | null = null;
    if (post.authorId && post.authorType) {
      const collectionName =
        post.authorType === "volunteer" ? "volunteers" : "shelters";
      const authorRef = doc(db, collectionName, post.authorId);
      const authorDoc = await getDoc(authorRef);

      console.log("Post author type:", post.authorType);
      console.log("Author document exists:", authorDoc.exists());

      if (authorDoc.exists()) {
        postAuthor =
          post.authorType === "volunteer"
            ? { type: UserType.VOLUNTEER, data: authorDoc.data() as Volunteer }
            : { type: UserType.SHELTER, data: authorDoc.data() as Shelter };
      }
    }

    console.log("Post author data:", postAuthor);

    const postWithAuthor = {
      ...post,
      author: postAuthor ?? undefined,
      comments: commentsWithAuthors,
      likes,
    };

    return Response.Success({
      posts: postWithAuthor,
      likeCount: likes.length,
      commentCount: commentsWithAuthors.length,
      isLiked,
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    return Response.Error("Failed to fetch post details");
  }
};

export const togglePostLike = async (
  postId: string,
  userId: string,
  isLike: boolean,
): Promise<{ message: string }> => {
  try {
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(postRef, "likes", userId);

    if (isLike) {
      await setDoc(likeRef, {
        likedAt: serverTimestamp(),
      });
      return { message: `Post ${postId} liked by user ${userId}` };
    } else {
      await deleteDoc(likeRef);
      return { message: `Post ${postId} unliked by user ${userId}` };
    }
  } catch (error: unknown) {
    console.error("Error toggling like:", error);
    throw new Error("Error toggling post like");
  }
};

export const addComment = async (
  postId: string,
  comment: PostComment,
): Promise<{ commentId: string }> => {
  try {
    const postRef = doc(db, "posts", postId);

    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }

    type CommentData = {
      authorId: string;
      authorType: string;
      comment: string | undefined;
      createdAt: ReturnType<typeof serverTimestamp>;
      replyToCommentId?: string;
    };

    const commentData: CommentData = {
      authorId: comment.authorId || "",
      authorType: comment.authorType?.toLowerCase() || "",
      comment: comment.comment,
      createdAt: serverTimestamp(),
      ...(comment.replyToCommentId
        ? { replyToCommentId: comment.replyToCommentId }
        : {}),
    };

    const commentsRef = collection(db, "posts", postId, "comments");
    const newCommentRef = await addDoc(commentsRef, commentData);

    console.log(`Comment added to post ${postId} with ID: ${newCommentRef.id}`);

    return { commentId: newCommentRef.id };
  } catch (error: unknown) {
    console.error(`Error adding comment to post ${postId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error adding comment";
    throw new Error(errorMessage);
  }
};

export const deleteComment = async (
  postId: string,
  commentId: string,
): Promise<void> => {
  try {
    const commentRef = doc(db, "posts", postId, "comments", commentId);

    await deleteDoc(commentRef);
    console.log(`Comment with ID: ${commentId} deleted from post ${postId}`);
  } catch (error: unknown) {
    console.error(`Error adding comment to post ${postId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error deleting comment";
    throw new Error(errorMessage);
  }
};

export const addPost = async (post: Post): Promise<{ postId: string }> => {
  try {
    const postData = {
      authorId: post.authorId,
      authorType: post.authorType?.toLowerCase(),
      content: post.content,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "posts"), postData);
    console.log(`Post added with ID: ${docRef.id}`);

    return { postId: docRef.id };
  } catch (error: unknown) {
    console.error(`Error adding post:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error adding post";
    throw new Error(errorMessage);
  }
};

export const editPost = async (
  postId: string,
  updatedContent: string,
): Promise<{ message: string }> => {
  try {
    const postRef = doc(db, "posts", postId);

    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }

    await updateDoc(postRef, {
      content: updatedContent,
      updatedAt: serverTimestamp(),
    });

    console.log(`Post with ID: ${postId} successfully updated`);
    return { message: "Post updated successfully" };
  } catch (error: unknown) {
    console.error(`Error updating post ${postId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error updating post";
    throw new Error(errorMessage);
  }
};

export const deletePost = async (
  postId: string,
): Promise<{ message: string }> => {
  try {
    const postRef = doc(db, "posts", postId);

    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }

    const commentsRef = collection(db, "posts", postId, "comments");
    const commentsSnapshot = await getDocs(commentsRef);
    const deleteCommentsPromises = commentsSnapshot.docs.map((commentDoc) =>
      deleteDoc(doc(db, "posts", postId, "comments", commentDoc.id)),
    );
    await Promise.all(deleteCommentsPromises);

    const likesRef = collection(db, "posts", postId, "likes");
    const likesSnapshot = await getDocs(likesRef);
    const deleteLikesPromises = likesSnapshot.docs.map((likeDoc) =>
      deleteDoc(doc(db, "posts", postId, "likes", likeDoc.id)),
    );
    await Promise.all(deleteLikesPromises);

    await deleteDoc(postRef);

    console.log(`Post with ID: ${postId} successfully deleted`);
    return { message: "Post deleted successfully" };
  } catch (error: unknown) {
    console.error(`Error deleting post ${postId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error deleting post";
    throw new Error(errorMessage);
  }
};
