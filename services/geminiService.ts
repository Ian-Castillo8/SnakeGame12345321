
import { GoogleGenAI, Type } from "@google/genai";
import { AICommentary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAICommentary = async (score: number, status: 'WIN' | 'LOSS' | 'MILESTONE'): Promise<AICommentary> => {
  try {
    const prompt = status === 'LOSS' 
      ? `The player just lost a game of Snake with a score of ${score}. Give a witty, short (max 15 words) "trash talk" or supportive comment. Be creative.`
      : `The player reached a score of ${score} in Snake. Give a short (max 15 words) cool reaction.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            tone: { 
              type: Type.STRING,
              description: 'One of: encouraging, mocking, impressed, mysterious'
            }
          },
          required: ["message", "tone"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      message: score > 20 ? "Impressive slithering!" : "Keep going, little snake.", 
      tone: 'encouraging' 
    };
  }
};

export const getDailyChallengeName = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a cool, neon-noir title for a digital snake arena (e.g., 'The Obsidian Grid', 'Cyber Slither'). Just the title.",
    });
    return response.text.trim();
  } catch {
    return "The Neon Void";
  }
};
