import { GoogleGenAI, Type, Schema } from "@google/genai";

// Initialize Gemini
// CRITICAL: process.env.API_KEY is handled externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LOGOS_MODEL = 'gemini-2.5-flash';

const constructionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    structureType: {
      type: Type.STRING,
      enum: ["Unstable Isotope", "Solid Axiom", "Bridging Hypothesis", "Grand Theory", "Logical Fallacy"],
      description: "The architectural classification of this knowledge block.",
    },
    stability: {
      type: Type.INTEGER,
      description: "0-100 score. Logic is gravity; fallacies cause collapse (low score). Truth is strong material (high score).",
    },
    visualManifestation: {
      type: Type.STRING,
      description: "A vivid visual description of this idea as a physical 3D structure (e.g. 'Crystalline Spire', 'Fractured Concrete').",
    },
    analysis: {
      type: Type.STRING,
      description: "A hard sci-fi architectural critique of the logic provided in the abstract.",
    },
  },
  required: ["structureType", "stability", "visualManifestation", "analysis"],
};

export const materializeKnowledge = async (abstract: string, title: string) => {
  try {
    const prompt = `
      Role: You are the "Logos Engine", the fundamental physics system of a reality where Information is Matter and Logic is Gravity.
      
      The Goal: A player is attempting to construct a "Knowledge Edifice" using a raw scientific abstract as a building block. 
      You must determine if this block is structurally sound enough to exist in this universe.

      The Physics of Truth:
      1. Coherence = Structural Integrity: Logical fallacies cause the structure to crumble (Low Stability).
      2. Evidence = Mass: Concrete data gives the object weight.
      3. Emergence: High stability (>90) creates perfection. Low stability (<30) creates hazardous waste.

      Input Data:
      Title: ${title}
      Content: ${abstract}
    `;

    const response = await ai.models.generateContent({
      model: LOGOS_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: constructionSchema,
        systemInstruction: "You are the Logos Engine. You evaluate logic as if it were structural engineering.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Construction failed:", error);
    // Fallback for offline/error mode
    return {
      structureType: "Unstable Isotope",
      stability: Math.floor(Math.random() * 40) + 10,
      visualManifestation: "A flickering, glitching geometric shape.",
      analysis: "Connection to Logos Server failed. Local fabrication integrity compromised.",
    };
  }
};