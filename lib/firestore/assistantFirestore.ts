import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { Response } from "@/types/interfaces/Response";
import { AssistantMessage } from "@/types/interfaces/AssistantMessage";

export async function saveAssistantConversation(
  shelterId: string,
  question: string,
  answer: string,
): Promise<Response<string>> {
  try {
    const historyRef = doc(db, "assistant_histories", shelterId);

    await setDoc(historyRef, {}, { merge: true });

    const messagesRef = collection(historyRef, "messages");
    await addDoc(messagesRef, {
      sender: "user",
      message: question,
      createdAt: serverTimestamp(),
    });
    await addDoc(messagesRef, {
      sender: "ai",
      message: answer,
      createdAt: serverTimestamp(),
    });
    return Response.Success(historyRef.id);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.Error(`Failed to save assistant conversation: ${msg}`);
  }
}

export async function getAssistantHistoryByShelterId(
  shelterId: string,
): Promise<Response<AssistantMessage[]>> {
  try {
    const historyDocRef = doc(db, "assistant_histories", shelterId);
    const messagesRef = collection(historyDocRef, "messages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));
    const messagesSnapshot = await getDocs(messagesQuery);

    const messages: AssistantMessage[] = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        sender: data.sender,
        message: data.message,
        createdAt: data.createdAt,
      };
    });

    return Response.Success(messages);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.Error(`Failed to retrieve assistant history: ${msg}`);
  }
}
