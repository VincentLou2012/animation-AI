import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, EpisodePlan, Genre } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeNovel = async (text: string): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash";
  
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      genre: { type: Type.STRING, enum: Object.values(Genre) },
      title: { type: Type.STRING },
      logline: { type: Type.STRING },
      themes: { type: Type.ARRAY, items: { type: Type.STRING } },
      pacing: { type: Type.STRING },
      targetAudience: { type: Type.STRING },
      characters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            description: { type: Type.STRING },
            traits: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "role", "description", "traits"]
        }
      }
    },
    required: ["genre", "title", "logline", "themes", "characters", "pacing", "targetAudience"]
  };

  const prompt = `You are an expert script editor for comic and animation adaptations. 
  Analyze the following web novel text. Identify its primary genre from the standard Chinese web novel categories.
  Extract the main characters, the core themes, and write a compelling logline.
  
  IMPORTANT: All values in the JSON output must be in Chinese (Simplified Chinese).
  
  Novel Text Segment:
  ${text.slice(0, 30000)}... (truncated for analysis)`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a precise literary analyst specialized in web novels. Always output in Chinese."
      }
    });

    if (response.text) {
        return JSON.parse(cleanJson(response.text)) as AnalysisResult;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

export const generateEpisodePlan = async (analysis: AnalysisResult, fullText: string): Promise<EpisodePlan[]> => {
  const model = "gemini-2.5-flash"; // Flash is good for structural tasks

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        episodeNumber: { type: Type.INTEGER },
        title: { type: Type.STRING },
        synopsis: { type: Type.STRING },
        keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
        charactersInvolved: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["episodeNumber", "title", "synopsis", "keyEvents", "charactersInvolved"]
    }
  };

  const prompt = `Based on the following novel analysis and text, break down the story into a list of comic/animation episodes. 
  Each episode should be fast-paced, containing a clear hook and cliffhanger if possible.
  Target length: 10-12 episodes for this segment.

  IMPORTANT: All output fields must be in Chinese (Simplified Chinese).

  Analysis: ${JSON.stringify(analysis)}
  
  Novel Text:
  ${fullText.slice(0, 50000)}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (response.text) {
        return JSON.parse(cleanJson(response.text)) as EpisodePlan[];
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Planning failed", error);
    throw error;
  }
};

export const generateScriptForEpisode = async (episode: EpisodePlan, analysis: AnalysisResult, contextText: string): Promise<string> => {
    // Use Pro for better creative writing
    const model = "gemini-3-pro-preview"; 

    const prompt = `Write a detailed script for a Manju (Comic/Motion Comic) based on the following episode plan.
    
    Genre: ${analysis.genre}
    Episode Title: ${episode.title}
    Synopsis: ${episode.synopsis}
    Key Characters: ${episode.charactersInvolved.join(', ')}

    Format Requirements:
    - Use standard script format.
    - [SCENE]: Describe the location and time.
    - [VISUAL]: Describe the panel/shot composition, character expressions, actions, and lighting.
    - [SFX]: Sound effects.
    - CHARACTER: Dialogue.
    - Focus on visual storytelling suitable for a vertical scroll comic or motion comic.
    
    IMPORTANT: The script content MUST be written in Chinese (Simplified Chinese).

    Generate the script for Episode ${episode.episodeNumber} now.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                // Not using JSON schema here, we want freeform creative markdown
                temperature: 0.8, 
            }
        });

        return response.text || "Failed to generate script content.";
    } catch (error) {
        console.error("Script generation failed", error);
        return "Error generating script. Please try again.";
    }
}