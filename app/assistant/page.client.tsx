"use client";

import { useEffect, useState, useRef } from "react";
import { Timestamp } from "firebase/firestore";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/inputs/ChatInput";
import useAuth from "@/hooks/useAuth";
import axios from "axios";
import { useAlert } from "@/context/AlertContext";
import { Icon } from "@iconify/react";
import { AssistantMessage } from "@/types/interfaces/AssistantMessage";
import clsx from "clsx";

export default function AssistantClient() {
  const [chats, setChats] = useState<AssistantMessage[]>([]);
  const [message, setMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { showAlert } = useAlert();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchChats();
    } else if (!authLoading) {
      setInitialLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const fetchChats = async () => {
    if (!user) return;

    try {
      setInitialLoading(true);
      const response = await axios.get(
        `/api/assistant?shelterId=${user.data.id}`,
      );
      if (response.data.messages) {
        setChats(response.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
      showAlert(
        "Failed to load conversation history",
        "error",
        "mdi:alert-circle",
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleRefresh = async (messageId: string, userQuestion: string) => {
    try {
      setGeneratingId(messageId);
      const response = await axios.patch("/api/assistant", {
        messageId,
        question: userQuestion,
      });

      const newAnswer = response.data.message;

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === messageId ? { ...chat, message: newAnswer } : chat,
        ),
      );

      showAlert("Response refreshed", "success", "mdi:refresh");
    } catch (err) {
      console.error("Failed to refresh response:", err);
      showAlert("Failed to refresh response", "error", "mdi:alert-circle");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      sender: "user" as const,
      message: message.trim(),
      createdAt: Timestamp.now(),
    };

    const tempAiId = `ai-${Date.now()}`;

    setChats((prevChats) => [
      ...prevChats,
      userMessage,
      {
        id: tempAiId,
        sender: "ai" as const,
        message: "...",
        createdAt: Timestamp.now(),
      },
    ]);

    setMessage("");
    setGeneratingId(tempAiId);

    try {
      const response = await axios.post("/api/assistant", {
        shelterId: user.data.id,
        question: userMessage.message,
      });

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === tempAiId
            ? {
                ...chat,
                message: response.data.message,
              }
            : chat,
        ),
      );
    } catch (err) {
      console.error("Failed to get AI response:", err);
      showAlert("Failed to get AI response", "error", "mdi:alert-circle");

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== tempAiId));
    } finally {
      setGeneratingId(null);
    }
  };

  const findUserQuestion = (index: number): string => {
    for (let i = index - 1; i >= 0; i--) {
      if (chats[i].sender === "user") {
        return chats[i].message;
      }
    }
    return "";
  };

  if (authLoading || initialLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Icon
          icon="mdi:loading"
          className="h-12 w-12 animate-spin text-lime-500"
        />
        <p className="mt-4 text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_2fr_1fr]">
      <aside className="sticky top-20 hidden justify-end pt-2 lg:flex">
        <div className="flex w-72 flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold">Your Assistant</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ready to provide insights and guidance, this AI-powered companion is
            here to assist with all your pet-related inquiries. Whether
            you&apos;re exploring adoption, seeking care tips, or simply curious
            about your furry friends, start a conversation and uncover
            personalized advice crafted just for you!
          </p>
        </div>
      </aside>

      <main
        className={clsx(
          "flex w-full flex-col p-4",
          chats.length === 0 && "h-screen",
        )}
      >
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">
                No messages yet. Start a conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat, idx) => (
                <ChatBubble
                  key={chat.id}
                  mode={chat.sender}
                  message={chat.message}
                  isGenerating={generatingId === chat.id}
                  onRefresh={
                    chat.sender === "ai"
                      ? () => handleRefresh(chat.id, findUserQuestion(idx))
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent py-4 dark:from-black dark:to-transparent">
          <ChatInput
            value={message}
            onChange={setMessage}
            onSend={handleSend}
          />
        </div>
      </main>
      <div className="hidden lg:block"></div>
    </div>
  );
}
