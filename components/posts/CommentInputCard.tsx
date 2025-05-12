"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Icon } from "@iconify/react";

export type CommentInputCardProps = {
  onSubmit: (text: string, replyToId?: string) => void;
  replyTo?: { id: string; authorName?: string };
  className?: string;
};

export type CommentInputCardHandle = {
  focus: () => void;
};

const CommentInputCard = forwardRef<
  CommentInputCardHandle,
  CommentInputCardProps
>(({ onSubmit, replyTo, className = "" }, ref) => {
  const [text, setText] = useState("");
  const [isReply, setIsReply] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
  }));

  useEffect(() => {
    setIsReply(!!replyTo);
  }, [replyTo]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(ta).lineHeight || "24", 10);
      const maxHeight = lineHeight * 8;
      ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim(), isReply ? replyTo?.id : undefined);
      setText("");
      setIsReply(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      {isReply && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Icon icon="mdi:reply" />
            <span>
              Replying to <strong>{replyTo?.authorName || "Comment"}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsReply(false)}
            className="hover:text-lime-green cursor-pointer p-1"
          >
            <Icon icon="mdi:close" className="h-4 w-4" />
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
        autoComplete="off"
        autoCorrect="off"
        placeholder="Write a comment..."
        className="focus:ring-lime-green w-full resize-none overflow-y-auto rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:ring focus:outline-none dark:border-gray-600 dark:bg-black dark:text-white"
      />

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{text.length}/1000</span>
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-lime-green inline-flex cursor-pointer items-center rounded px-3 py-2 text-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          <Icon icon="mdi:send" className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
});

CommentInputCard.displayName = "CommentInputCard";
export default CommentInputCard;
