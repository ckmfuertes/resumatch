import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("Gemini API key is not set in environment variables");
}

export const geminiAi = new GoogleGenAI({ apiKey: geminiApiKey });
