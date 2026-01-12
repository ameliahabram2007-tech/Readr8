
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export const getBookInsights = async (title: string, author: string) => {
  const ai = getAI();
  const prompt = `Gib mir eine kurze Zusammenfassung (max. 3 Sätze) und passende Genres für das Buch "${title}" von ${author} auf Deutsch. Antworte in JSON.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            genres: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "genres"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Keine Antwort von KI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
