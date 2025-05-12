import { Timestamp } from "firebase/firestore";

export interface AssistantMessage {
  id: string;
  sender: "user" | "ai";
  message: string;
  createdAt: Timestamp;
}
