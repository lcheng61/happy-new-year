
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Resolution, CelebrationMessage } from "../types.ts";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export const generateResolutions = async (interests: string): Promise<Resolution[]> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these interests: "${interests}", generate 3 personalized New Year resolutions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            goal: { type: Type.STRING },
            action: { type: Type.STRING },
          },
          required: ["id", "category", "goal", "action"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse resolutions", e);
    return [];
  }
};

export const generateCelebrationSpeech = async (mood: string): Promise<CelebrationMessage> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a short, powerful New Year's speech for someone feeling "${mood}". Keep it under 100 words.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          author: { type: Type.STRING },
        },
        required: ["title", "content", "author"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse speech", e);
    return { title: "Happy New Year!", content: "Wishing you a great year ahead.", author: "Gemini AI" };
  }
};

export const generateFestiveImage = async (theme: string): Promise<string | null> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A high-quality, cinematic, festive New Year celebration wallpaper. Theme: ${theme}. Golden fireworks, champagne, midnight sky, luxury aesthetic.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Generates speech audio for a given text.
 * Gemini TTS returns raw PCM data (24kHz, 16-bit, mono).
 * Defaulting to 'Puck' for a male voice.
 */
export const generateSpeechAudio = async (text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Puck'): Promise<string | null> => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS generation failed:", error);
    return null;
  }
};
