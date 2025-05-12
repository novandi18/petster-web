"use client";

import { PostComment } from "@/types/interfaces/Post";
import { formatDate } from "@/utils/postUtil";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";

export type CommentCardProps = {
  comment: PostComment;
  repliedComment?: PostComment | null;
  onReply?: (commentId?: string) => void;
  onMentionClick?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  isHighlighted?: boolean;
  className?: string;
};

export default function CommentCard({
  comment,
  repliedComment,
  onReply,
  onMentionClick,
  onDelete,
  isHighlighted = false,
  className = "",
}: CommentCardProps) {
  const { user } = useAuth();
  const authorName = comment.author?.data?.name || "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded((e) => !e);

  const isOwnComment = user?.data?.id === comment.authorId;

  const handleMentionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (repliedComment?.id && onMentionClick) {
      onMentionClick(repliedComment.id);
    }
  };

  const renderCommentContent = () => {
    if (!comment.comment) return null;

    if (comment.replyToCommentId && !repliedComment) {
      return (
        <>
          <span className="font-bold text-gray-500 dark:text-gray-400">
            @Deleted Comment{" "}
          </span>
          {comment.comment}
        </>
      );
    }

    if (comment.replyToCommentId && repliedComment?.author?.data?.name) {
      const isReplyingToSelf = user?.data?.id === repliedComment.authorId;

      return (
        <>
          <span
            className="cursor-pointer font-bold text-blue-500 hover:underline dark:text-blue-400"
            onClick={handleMentionClick}
          >
            {isReplyingToSelf
              ? "@You"
              : `@${repliedComment.author.data.name}`}{" "}
          </span>
          {comment.comment}
        </>
      );
    }

    return comment.comment;
  };

  const highlightClass = isHighlighted
    ? "animate-highlight border-lime-500 dark:border-lime-500"
    : "border-gray-200 dark:border-gray-700";

  return (
    <div
      id={`comment-${comment.id}`}
      className={`mb-4 rounded-xl border ${highlightClass} bg-gray-50 p-4 transition-colors duration-300 dark:bg-black ${className}`}
    >
      <div className="mb-2 flex items-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700">
          <span className="text-sm font-semibold text-white">{initial}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-black dark:text-white">
            {authorName}
          </p>
          {comment.createdAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
            </p>
          )}
        </div>
      </div>

      <p
        className={`mb-3 text-sm text-gray-800 dark:text-gray-200 ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {renderCommentContent()}
      </p>

      {comment.comment && comment.comment.split("\n").length > 2 && (
        <button
          onClick={toggleExpand}
          className="text-lime-green mb-2 text-xs font-medium hover:underline"
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      )}

      <div className="flex flex-row items-center gap-3">
        <button
          onClick={() => onReply?.(comment.id)}
          className="hover:text-lime-green cursor-pointer text-xs text-gray-600 dark:text-gray-400"
        >
          Reply
        </button>

        {isOwnComment && (
          <button
            onClick={() => onDelete?.(comment.id || "")}
            className="cursor-pointer text-xs text-gray-600 hover:text-red-700 dark:text-gray-400"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
