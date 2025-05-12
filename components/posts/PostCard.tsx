"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Post } from "@/types/interfaces/Post";
import { formatDate } from "@/utils/postUtil";

export type PostCardProps = {
  post: Post;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onClick: () => void;
  className?: string;
};

export default function PostCard({
  post,
  isLiked,
  likeCount,
  commentCount,
  onLike,
  onClick,
  className = "",
}: PostCardProps) {
  const authorName = post.author?.data?.name || "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();
  const formattedDate = formatDate(post.createdAt);

  return (
    <Link
      href={`/community/${post.id}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`block rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:hover:bg-gray-900 ${className}`}
    >
      <div className="mb-2 flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700">
            <span className="text-lg font-semibold text-white">{initial}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-black dark:text-white">
            {authorName}
          </p>
          {post.createdAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formattedDate}
            </p>
          )}
        </div>
      </div>

      {post.content && (
        <p className="mb-4 line-clamp-3 text-sm text-gray-800 dark:text-gray-200">
          {post.content}
        </p>
      )}

      <div className="flex items-center space-x-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLike();
          }}
          className="flex cursor-pointer items-center space-x-1 text-sm"
        >
          <Icon
            icon={isLiked ? "mdi:heart" : "mdi:heart-outline"}
            className={`h-5 w-5 hover:text-red-500 ${isLiked ? "text-red-500" : ""}`}
          />
          <span>{likeCount}</span>
        </button>

        <div className="flex items-center space-x-1 text-sm">
          <Icon icon="mdi:comment-outline" className="h-5 w-5" />
          <span>{commentCount}</span>
        </div>
      </div>
    </Link>
  );
}
