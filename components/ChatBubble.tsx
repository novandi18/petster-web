import React from "react";
import { Icon } from "@iconify/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface ChatBubbleProps {
  mode: "user" | "ai";
  message: string;
  onRefresh?: () => void;
  isGenerating?: boolean;
}

export default function ChatBubble({
  mode,
  message,
  onRefresh,
  isGenerating = false,
}: ChatBubbleProps) {
  const isUser = mode === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[80%] rounded-xl p-3 ${
          isUser
            ? "bg-lime-green rounded-tr-none text-black"
            : "rounded-tl-none bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        {isUser ? (
          <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown>
        ) : (
          <>
            <div className="ps-1">
              {isGenerating ? (
                <p className="text-sm text-gray-500">Thinking...</p>
              ) : (
                <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown>
              )}

              {onRefresh && !isGenerating && (
                <div className="mt-2">
                  <button
                    onClick={onRefresh}
                    className="cursor-pointer rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Icon icon="mdi:refresh" className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
