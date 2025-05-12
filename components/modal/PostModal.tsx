"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import AiButton from "@/components/buttons/AiButton";
import { aiOptions } from "@/types/constants/aiPrompt";

type PostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  content?: string;
  mode?: "create" | "edit";
};

export default function PostModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError = null,
  content: initialContent = "",
  mode = "create",
}: PostModalProps) {
  const [content, setContent] = useState(initialContent);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && initialContent) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  useEffect(() => {
    if (!isOpen && mode === "create") {
      setContent("");
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [content]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 1000) {
      setContent(e.target.value);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() || isSubmitting) return;
    onSubmit(content.trim());
  };

  const handleAiImprovement = async (option: string) => {
    if (!content.trim()) {
      setError("Please write some content first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsProcessing(option);
    setError(null);

    try {
      const response = await fetch("/api/community/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          aiOption: option,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to improve content");
      }

      const result = await response.json();
      setContent(result.improvedContent);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process content",
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsProcessing(null);
    }
  };

  if (!isOpen) return null;

  // Dynamic content based on mode
  const modalTitle = mode === "create" ? "Create Post" : "Edit Post";
  const buttonText = mode === "create" ? "Post" : "Update";
  const buttonIcon = mode === "create" ? "mdi:plus" : "mdi:check";
  const loadingText = mode === "create" ? "Posting..." : "Updating...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{modalTitle}</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-500">
            <Icon icon="mdi:close" className="h-5 w-5" />
          </button>
        </div>

        <div className="hide-scrollbar mb-4 flex space-x-2 overflow-x-auto rounded-xl">
          {aiOptions.map((opt) => (
            <AiButton
              key={opt}
              text={opt}
              isLoading={isProcessing === opt}
              onClick={() => handleAiImprovement(opt)}
              disabled={!!isProcessing}
            />
          ))}
        </div>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <Icon icon="mdi:alert-circle" className="mr-1 inline h-4 w-4" />
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="mb-3 rounded-md bg-blue-50 p-2 text-sm text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Icon
              icon="mdi:loading"
              className="mr-1 inline h-4 w-4 animate-spin"
            />
            Improving your content with AI...
          </div>
        )}

        {submitError && (
          <div className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <Icon icon="mdi:alert-circle" className="mr-1 inline h-4 w-4" />
            {submitError}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="What's on your mind?"
          maxLength={1000}
          disabled={!!isProcessing}
          rows={10}
          className="focus:ring-lime-green w-full resize-none overflow-hidden rounded border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
        />
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {content.length}/1000
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || !!isProcessing || isSubmitting}
            className="bg-lime-green hover:bg-lime-green/80 inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icon
                  icon="mdi:loading"
                  className="mr-2 h-5 w-5 animate-spin"
                />
                {loadingText}
              </>
            ) : (
              <>
                <Icon icon={buttonIcon} className="mr-2 h-5 w-5" />
                {buttonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
