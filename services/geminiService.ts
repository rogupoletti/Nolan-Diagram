
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a more user-friendly error.
  // Here we assume it's set in the environment.
  console.error("API_KEY is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const languageMap: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  'pt-BR': 'Brazilian Portuguese'
}

export const getPoliticalCategoryDescription = async (category: string, lang: Language): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Cannot fetch description.";
  
  const languageName = languageMap[lang] || 'English';

  const prompt = `
  Provide a brief, neutral, and easy-to-understand description for the following political ideology based on the Nolan Chart, which plots personal freedom vs. economic freedom. The description should be about 2-3 sentences long.
  Respond in ${languageName}.

  Ideology: ${category}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching description from Gemini API:", error);
    return "Could not load description. Please try again later.";
  }
};
