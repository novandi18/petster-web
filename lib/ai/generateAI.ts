import { GoogleGenAI } from "@google/genai";
import {
  assistantDefaultPrompt,
  getPromptForOption,
} from "@/types/constants/aiPrompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
): Promise<T> {
  let retries = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries > maxRetries) {
        throw error;
      }
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

export async function generateAIContent(
  content: string,
  aiOption: string,
): Promise<string> {
  try {
    const prompt = getPromptForOption(aiOption, content);

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text ?? "";
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw new Error("Failed to generate AI content");
  }
}

export async function generateAssistantResponse(
  question: string,
): Promise<string> {
  return retryWithBackoff(async () => {
    const prompt = assistantDefaultPrompt.replace("%s", question);
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      contents: prompt,
    });
    if (!response.text) throw new Error("Empty response from AI");
    return response.text;
  });
}
