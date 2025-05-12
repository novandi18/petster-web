"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/posts/PostCard";
import PostModal from "@/components/modal/PostModal";
import { PostResult } from "@/types/interfaces/Post";
import useAuth from "@/hooks/useAuth";
import { UserType } from "@/types/enums/userType";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function CommunityPage() {
  const router = useRouter();
  const PAGE_SIZE = 10;
  const { user, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchPosts = async (startAfterKey: string | null = null) => {
    if (loading || (!hasMore && startAfterKey) || authLoading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      if (startAfterKey) params.append("startAfter", startAfterKey);
      if (user?.data.id) params.append("uuid", user.data.id);

      const response = await fetch(`/api/community?${params.toString()}`);
      const result = await response.json();

      if (result.status === "success" && result.data) {
        const { data, nextPageKey: newNextPageKey } = result.data;

        if (startAfterKey) {
          setPosts((prev) => [...prev, ...data]);
        } else {
          setPosts(data);
        }

        setNextPageKey(newNextPageKey);
        setHasMore(!!newNextPageKey);
      } else {
        console.error("Failed to fetch posts:", result.message);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [authLoading, user]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        hasMore &&
        !loading &&
        !authLoading &&
        user
      ) {
        fetchPosts(nextPageKey);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [nextPageKey, hasMore, loading, authLoading, user]);

  const handleLike = async (postId: string) => {
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      router.push("/connect");
      return;
    }

    const currentPost = posts.find((post) => post.posts?.id === postId);
    const isCurrentlyLiked = currentPost?.isLiked || false;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.posts?.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
          };
        }
        return post;
      }),
    );

    try {
      const response = await fetch(`/api/community/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: user.data.id,
          isLike: !isCurrentlyLiked,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage =
            errorJson.error || errorJson.message || "Unknown error";
        } catch {
          errorMessage = errorText || "Failed to update like status";
        }

        console.error(
          `Server responded with ${response.status}: ${errorMessage}`,
        );
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Like updated:", result.message);
    } catch (error) {
      console.error("Error updating like status:", error);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.posts?.id === postId) {
            return {
              ...post,
              isLiked: isCurrentlyLiked,
              likeCount: isCurrentlyLiked
                ? post.likeCount + 1
                : post.likeCount - 1,
            };
          }
          return post;
        }),
      );
    }
  };

  const handlePostClick = (postId: string) => {
    router.push(`/community/${postId}`);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmitPost = async (content: string) => {
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const tempId = `temp-${Date.now()}`;
    const optimisticPost: PostResult = {
      posts: {
        id: tempId,
        authorId: user.data.id,
        authorType: user.type === UserType.VOLUNTEER ? "volunteer" : "shelter",
        content: content,
        createdAt: new Date(),
        author: user,
      },
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
    };

    setPosts((prevPosts) => [optimisticPost, ...prevPosts]);
    closeModal();

    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorId: user.data.id,
          authorType:
            user.type === UserType.VOLUNTEER ? "volunteer" : "shelter",
          content: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const result = await response.json();

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.posts?.id === tempId
            ? { ...post, posts: { ...post.posts!, id: result.postId } }
            : post,
        ),
      );

      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);

      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.posts?.id !== tempId),
      );

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setSubmitError(`Failed to create post: ${errorMessage}`);
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icon
          icon="line-md:loading-twotone-loop"
          className="text-lime-green text-4xl"
        />
      </div>
    );
  }

  return (
    <>
      <PostModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitPost}
        isSubmitting={isSubmitting}
        submitError={submitError}
        mode="create"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <aside className="sticky top-20 hidden justify-end pt-4 lg:flex">
          <div className="flex w-72 flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Welcome to Community!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share adoption tips, DIY treats, grooming advice or vaccination
                insights.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-lime-green w-full cursor-pointer rounded-full py-2 text-black"
            >
              Create Post
            </button>
          </div>
        </aside>

        <main className="w-full p-4">
          {posts.map((post: PostResult) =>
            post.posts ? (
              <div key={post.posts.id} className="mb-4">
                <PostCard
                  post={post.posts}
                  isLiked={post.isLiked}
                  likeCount={post.likeCount}
                  commentCount={post.commentCount}
                  onLike={() => post.posts?.id && handleLike(post.posts.id)}
                  onClick={() =>
                    post.posts?.id && handlePostClick(post.posts.id)
                  }
                />
              </div>
            ) : null,
          )}
          {loading && (
            <div className="flex justify-center py-4">
              <Icon
                icon="line-md:loading-twotone-loop"
                className="text-lime-green text-4xl"
              />
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p className="text-center text-sm text-gray-500">
              No more posts to load
            </p>
          )}
          {!loading && posts.length === 0 && (
            <p className="text-center text-sm text-gray-500">No posts found</p>
          )}
        </main>
      </div>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="bg-lime-green fixed right-4 bottom-4 cursor-pointer rounded-full px-6 py-4 text-black lg:hidden"
      >
        Create Post
      </button>
    </>
  );
}
