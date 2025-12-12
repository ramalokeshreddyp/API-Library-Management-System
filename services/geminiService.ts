import { GoogleGenAI } from "@google/genai";
import { Book } from "../types.ts";

export const generateBookDescription = async (title: string, author: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: `Write a short, engaging 2-sentence summary for the book "${title}" by ${author}.` }] }],
    });
    return response.text || "Description unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Description unavailable.";
  }
};

export const askLibrarian = async (query: string, catalog: Book[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Create a lightweight context of the catalog
    const catalogContext = catalog.map(b => `${b.title} by ${b.author} (${b.category})`).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [{
          text: `You are a helpful librarian assistant for "LibraFlow". 
          Current Catalog: [${catalogContext}]
          
          User Query: "${query}"
          
          Answer the user based on the catalog or general book knowledge. Keep it brief and helpful.`
        }]
      }],
    });
    return response.text || "I'm having trouble thinking right now. Please try again later.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble thinking right now. Please try again later.";
  }
};