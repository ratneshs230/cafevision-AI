
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SiteAnalysis, CafeLayout, DesignStyle } from "../types";

// Initialize AI client
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Analyzes a raw site image to provide architectural context.
 */
export const analyzeSite = async (base64Image: string): Promise<SiteAnalysis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: "Analyze this construction site image for a potential cafe. Estimate space dimensions, lighting conditions, architectural features, and potential design challenges. Return the data in valid JSON format." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dimensions: { type: Type.STRING },
          lighting: { type: Type.STRING },
          architecturalFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          potentialChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
          vibeRecommendation: { type: Type.STRING }
        },
        required: ["dimensions", "lighting", "architecturalFeatures", "potentialChallenges", "vibeRecommendation"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates 10 layout suggestions based on the site analysis.
 */
export const generateLayouts = async (analysis: SiteAnalysis, base64Image: string): Promise<CafeLayout[]> => {
  const ai = getAI();
  const prompt = `Based on this site analysis: ${JSON.stringify(analysis)}, generate 10 diverse cafe layout concepts. 
  Include various styles like Modern, Rustic, Minimalist, Industrial, and Bohemian. 
  For each layout, provide a title, detailed description, the style category, and a specific visualization prompt for an AI image editor.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
        parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt }
        ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            style: { type: Type.STRING, enum: Object.values(DesignStyle) },
            imagePrompt: { type: Type.STRING },
            suggestedFeatures: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "title", "description", "style", "imagePrompt", "suggestedFeatures"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

/**
 * Visualizes a layout by editing the original site image.
 */
export const visualizeLayout = async (originalImage: string, prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: originalImage.split(',')[1], mimeType: 'image/jpeg' } },
        { text: `Transform this raw space into a cafe visualization. Instruction: ${prompt}` }
      ]
    }
  });

  let imageUrl = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Failed to generate visualization image.");
  return imageUrl;
};

/**
 * Refines an image based on a user text prompt.
 */
export const refineVisualization = async (currentImage: string, userPrompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: currentImage.split(',')[1], mimeType: 'image/jpeg' } },
        { text: `Edit this cafe visualization according to the following instruction: ${userPrompt}. Maintain the general structure and style but apply the requested changes accurately.` }
      ]
    }
  });

  let imageUrl = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Failed to refine visualization.");
  return imageUrl;
};
