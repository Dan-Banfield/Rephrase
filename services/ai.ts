import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateMessage = async (originalMessage: string, demographic: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      System: You are a message rephrasing engine. Your ONLY purpose is to rewrite the input message to strictly match the target demographic tone. 
      - Do NOT output quotes.
      - Do NOT output introductory text like "Here is the message".
      - Output ONLY the rewritten text.

      Input Message: "${originalMessage}"
      Target Demographic: "${demographic}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return originalMessage;
  }
};