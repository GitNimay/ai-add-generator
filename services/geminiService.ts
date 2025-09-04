import { GoogleGenAI, Type } from "@google/genai";
import type { AdScript } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const adScriptSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A catchy, short title for the commercial. (e.g., 'Unleash the Sound')."
    },
    tagline: {
      type: Type.STRING,
      description: "A memorable tagline for the product. (e.g., 'Your World, Your Music.')."
    },
    scenes: {
      type: Type.ARRAY,
      description: "An array of scenes that make up the 30-second commercial.",
      items: {
        type: Type.OBJECT,
        properties: {
          sceneNumber: {
            type: Type.INTEGER,
            description: "The sequential number of the scene."
          },
          setting: {
            type: Type.STRING,
            description: "The visual setting of the scene. (e.g., 'A vibrant, sunlit city park.')."
          },
          action: {
            type: Type.STRING,
            description: "A description of the main action and visuals in the scene."
          },
          dialogue: {
            type: Type.STRING,
            description: "Any dialogue or voiceover in the scene. Use 'VO:' for voiceover. Use 'None' if no dialogue."
          },
          sound: {
            type: Type.STRING,
            description: "Description of sound effects or music in the scene."
          }
        },
        required: ["sceneNumber", "setting", "action", "dialogue", "sound"]
      }
    }
  },
  required: ["title", "tagline", "scenes"]
};

export async function generateAdScript(
  base64Image: string,
  mimeType: string,
  productDescription: string
): Promise<AdScript> {

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `
      You are a world-class creative director at a major advertising agency. 
      Your task is to generate a short, punchy, and visually compelling 30-second commercial script based on the provided product image and description.
      The script should be structured, creative, and ready for a production team.
      The tone should be energetic and inspiring.
      Ensure the output is a valid JSON object matching the provided schema.

      Product Description: ${productDescription || 'No description provided. Analyze the image.'}
    `
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: adScriptSchema,
        temperature: 0.8,
        topP: 0.9,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AdScript;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error && error.message.includes('429')) {
         throw new Error("API rate limit exceeded. Please try again later.");
    }
    throw new Error("Failed to generate ad script. The model may have returned an invalid response.");
  }
}


export async function generateAdVideo(prompt: string, base64Image: string, mimeType: string): Promise<string> {
  try {
    console.log("Starting video generation...");
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      image: {
        imageBytes: base64Image,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1
      }
    });

    console.log("Video generation initiated, polling for result...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Polling... done:", operation.done);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    console.log("Video generated successfully:", downloadLink);
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Video generation failed:", error);
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
      throw new Error("API quota exceeded. Please check your plan and billing details, or try again later.");
    }
    throw new Error("Failed to generate video ad. An unexpected error occurred.");
  }
}