"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { formatDate } from "@/utils/postUtil";
import { Post, PostComment, PostResult } from "@/types/interfaces/Post";
import CommentCard from "@/components/posts/CommentCard";
import CommentInputCard, {
  CommentInputCardHandle,
} from "@/components/posts/CommentInputCard";
import { UserType } from "@/types/enums/userType";
import useAuth from "@/hooks/useAuth";
import Dropdown from "@/components/Dropdown";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import PostModal from "@/components/modal/PostModal";
import { useAlert } from "@/context/AlertContext";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user, loading: authLoading } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  const commentInputRef = useRef<CommentInputCardHandle>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (replyTo) {
      const inputSection = document.getElementById("comment-input-section");
      if (inputSection) {
        inputSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [replyTo]);

  useEffect(() => {
    if (!id || authLoading) return;

    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const apiUrl = `/api/community/${id}${
          user?.data?.id
            ? `?currentUserId=${encodeURIComponent(user.data.id)}`
            : ""
        }`;
        console.log("Fetching from URL:", apiUrl);

        const response = await fetch(apiUrl);
        console.log("API Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error response:", errorText);
          throw new Error(
            `Failed to fetch post: ${response.status} ${response.statusText}`,
          );
        }

        const result = await response.json();
        console.log(result);

        if (result.data) {
          const postResult = result.data as PostResult;
          setPost(postResult.posts || null);
          setIsLiked(postResult.isLiked);
          setLikeCount(postResult.likeCount);
          setComments(postResult.posts?.comments || []);
        } else {
          console.error("No data in response:", result);
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id, authLoading, user, router]);

  const toggleLike = async () => {
    if (!user || !id) return;

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((prev) => prev + (wasLiked ? -1 : 1));

    try {
      const response = await fetch(`/api/community/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: id,
          userId: user.data.id,
          isLike: !wasLiked,
        }),
      });

      if (!response.ok) {
        setIsLiked(wasLiked);
        setLikeCount((prev) => prev + (wasLiked ? 1 : -1));

        const errorText = await response.text();
        console.error(`Error toggling like: ${errorText}`);
      }
    } catch (error) {
      setIsLiked(wasLiked);
      setLikeCount((prev) => prev + (wasLiked ? 1 : -1));
      console.error("Error toggling like:", error);
    }
  };

  const handleCommentSubmit = async (text: string, replyToId?: string) => {
    if (!user || !id) return;

    type CommentFormData = {
      authorId: string;
      authorType: string;
      comment: string;
      replyToCommentId?: string;
    };

    const commentData: CommentFormData = {
      authorId: user.data.id,
      authorType: user.type === UserType.VOLUNTEER ? "volunteer" : "shelter",
      comment: text,
      ...(replyToId ? { replyToCommentId: replyToId } : {}),
    };

    const newComment: PostComment = {
      id: `temp-${Date.now()}`,
      authorId: user.data.id,
      authorType: user.type === UserType.VOLUNTEER ? "volunteer" : "shelter",
      comment: text,
      createdAt: new Date(),
      author: user,
      ...(replyToId ? { replyToCommentId: replyToId } : {}),
    };

    setComments((prev) => [...prev, newComment]);
    setReplyTo(null);

    try {
      const response = await fetch(`/api/community/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to post comment: ${errorText}`);
      }

      const result = await response.json();

      setComments((prev) =>
        prev.map((c) =>
          c.id === newComment.id ? { ...c, id: result.commentId } : c,
        ),
      );

      const apiUrl = `/api/community/${id}?currentUserId=${encodeURIComponent(user.data.id)}`;
      const refreshResponse = await fetch(apiUrl);

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        if (refreshResult.data?.posts?.comments) {
          setComments(refreshResult.data.posts.comments);
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);

      setComments((prev) => prev.filter((c) => c.id !== newComment.id));
    }
  };

  const handleMentionClick = (commentId: string) => {
    setHighlightedCommentId(commentId);

    const commentElement = document.getElementById(`comment-${commentId}`);
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => {
      setHighlightedCommentId(null);
    }, 1500);
  };

  const handleReplyClick = (commentId?: string) => {
    if (!commentId) {
      setReplyTo(null);
      return;
    }

    const commentToReply = comments.find((c) => c.id === commentId);
    if (commentToReply && commentToReply.author?.data?.name) {
      setReplyTo({
        id: commentId,
        authorName: commentToReply.author.data.name,
      });

      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !id) return;

    const deletedComment = comments.find((c) => c.id === commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      const response = await fetch(`/api/community/${id}/comment`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete comment: ${errorText}`);
      }

      showAlert("Comment deleted successfully", "success", "mdi:check-circle");
    } catch (error) {
      console.error("Error deleting comment:", error);

      if (deletedComment) {
        setComments((prev) => [...prev, deletedComment]);
        showAlert("Failed to delete comment", "error");
      }
    }
  };

  const handleDeletePost = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/community/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete post");
      }
      showAlert("Post deleted successfully", "success", "mdi:check-circle");

      router.push("/community");
    } catch (error) {
      console.error("Error deleting post:", error);
      showAlert("Failed to delete post", "error");
    }
  };

  const handleEditPost = async (updatedContent: string) => {
    if (!id || !user) return;

    setIsSubmittingEdit(true);
    setEditError(null);

    try {
      const response = await fetch(`/api/community`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: id,
          content: updatedContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update post");
      }

      setPost((prev) => (prev ? { ...prev, content: updatedContent } : null));
      setIsEditModalOpen(false);
      showAlert("Post updated successfully", "success", "mdi:check-circle");
    } catch (error) {
      console.error("Error updating post:", error);
      setEditError(
        error instanceof Error ? error.message : "Failed to update post",
      );
      showAlert(
        error instanceof Error ? error.message : "Failed to update post",
        "error",
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-screen-md p-4 text-center">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Loading post...</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="mx-auto max-w-screen-md p-4 text-center text-gray-600 dark:text-gray-400">
        {error || "Post not found."}
      </main>
    );
  }

  const authorName = post.author?.data?.name || "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();

  return (
    <main>
      <div className="p-4">
        <div className="mx-auto mb-4 max-w-screen-md space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700">
                <span className="text-lg font-semibold text-white">
                  {initial}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {authorName}
                </p>
                {post.createdAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(post.createdAt)}
                  </p>
                )}
              </div>
            </div>

            {user?.data.id === post.authorId && (
              <Dropdown>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex w-full cursor-pointer items-center space-x-2 rounded px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Icon icon="mdi:pencil" className="h-5 w-5" />
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex w-full cursor-pointer items-center space-x-2 rounded px-4 py-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800"
                >
                  <Icon icon="mdi:delete-outline" className="h-5 w-5" />
                  <span>Delete Post</span>
                </button>
              </Dropdown>
            )}
          </div>

          <p className="mt-4 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {post.content}
          </p>

          <div className="mt-4">
            <button
              disabled={!user}
              onClick={toggleLike}
              className={`flex cursor-pointer items-center gap-1 ${
                isLiked ? "text-red-500" : "text-gray-600 dark:text-gray-400"
              } transition ${user ? "hover:text-red-500" : "cursor-not-allowed opacity-50"}`}
            >
              <Icon
                icon={isLiked ? "mdi:heart" : "mdi:heart-outline"}
                className="h-5 w-5"
              />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>

        <section className="mx-auto max-w-screen-md space-y-6 pb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Comments{" "}
            <span className="ms-1 rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600">
              {comments.length}
            </span>
          </h2>
          {comments.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Be the first to comment on this post.
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => {
                let parentComment = null;
                if (c.replyToCommentId) {
                  parentComment =
                    comments.find(
                      (parent) => parent.id === c.replyToCommentId,
                    ) || null;
                }

                return (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    repliedComment={parentComment}
                    isHighlighted={highlightedCommentId === c.id}
                    onMentionClick={handleMentionClick}
                    onReply={user ? handleReplyClick : undefined}
                    onDelete={handleDeleteComment}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      {user && (
        <section
          id="comment-input-section"
          className="sticky bottom-0 left-0 z-10 w-full px-4"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white to-white/80 dark:from-black dark:via-black dark:to-black/80"></div>
          <div className="relative">
            <CommentInputCard
              ref={commentInputRef}
              onSubmit={handleCommentSubmit}
              replyTo={replyTo || undefined}
              className="mx-auto flex max-w-screen-md flex-col space-y-2 pb-4"
            />
          </div>
        </section>
      )}

      {user?.data.id === post.authorId && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeletePost}
          title="Delete Post"
          description="Are you sure you want to delete this post? This action cannot be undone."
          icon="mdi:delete-alert"
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
        />
      )}

      {post && (
        <PostModal
          content={post.content}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditPost}
          isSubmitting={isSubmittingEdit}
          submitError={editError}
          mode="edit"
        />
      )}
    </main>
  );
}
