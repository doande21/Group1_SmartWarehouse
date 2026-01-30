
import { GoogleGenAI, Type } from "@google/genai";

export async function getWarehouseInsights(inventorySummary: string) {
  try {
    // Create a new GoogleGenAI instance right before making an API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Smart Warehouse Optimization AI. Analyze this inventory summary and provide 3 short actionable insights for efficiency: ${inventorySummary}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of warehouse optimization insights"
            }
          }
        }
      }
    });
    
    // Use .text property directly.
    return JSON.parse(response.text).insights as string[];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Maintain standard safety protocols.", "Optimize robot pathing for low-battery units.", "Monitor high-traffic categories."];
  }
}
