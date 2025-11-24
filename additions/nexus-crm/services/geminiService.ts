import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from '../types';

// Initialize Gemini Client
// Note: In a real production app, use a backend proxy to secure the key.
// For this demo, we use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLead = async (lead: Lead): Promise<{ analysis: string; score: number }> => {
  try {
    const prompt = `
      You are a senior CRM sales analyst. Analyze the following lead and provide a brief strategic insight (max 2 sentences) and a conversion probability score (0-100).
      
      Lead Name: ${lead.name}
      Source: ${lead.source}
      Initial Message: "${lead.message}"
      Potential Value: $${lead.potentialValue}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.STRING,
              description: "Brief strategic insight and next steps.",
            },
            score: {
              type: Type.INTEGER,
              description: "Conversion probability score from 0 to 100.",
            },
          },
          required: ["analysis", "score"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        return { analysis: "AI analysis unavailable at this time.", score: 50 };
    }
    
    const result = JSON.parse(jsonText);
    return {
      analysis: result.analysis,
      score: result.score
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      analysis: "Could not generate analysis due to connection error.",
      score: 0
    };
  }
};

export const generateColdEmail = async (lead: Lead): Promise<string> => {
  try {
    const prompt = `Write a short, professional, and personalized cold email introduction to ${lead.name} who inquired via ${lead.source}. Their message was: "${lead.message}". Keep it under 100 words.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text || "Could not generate email draft.";
  } catch (error) {
    console.error("Gemini Email Gen Error:", error);
    return "Error generating email draft.";
  }
}