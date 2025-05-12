import React, { useRef } from "react";
import { Icon } from "@iconify/react";

export interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      const lineHeight = parseFloat(getComputedStyle(ta).lineHeight);
      const maxHeight = lineHeight * 5;
      ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
    }
  };

  return (
    <div className="flex items-end space-x-2 p-4">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={handleInput}
        placeholder="Type a message..."
        className="focus:ring-lime-green flex-1 resize-none overflow-hidden rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm focus:ring focus:outline-none dark:border-gray-600 dark:bg-black dark:placeholder-gray-500"
      />
      <button
        onClick={onSend}
        disabled={!value.trim()}
        className="bg-lime-green cursor-pointer rounded-full p-2 text-black disabled:cursor-not-allowed"
      >
        <Icon icon="mdi:send" className="h-5 w-5" />
      </button>
    </div>
  );
}
