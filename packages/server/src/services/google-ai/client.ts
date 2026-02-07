import { GoogleGenAI } from '@google/genai';
import { config } from '../../config';

let instance: GoogleGenAI | undefined;

/** Lazy singleton — returns undefined when GOOGLE_AI_API_KEY is not set */
export function getGoogleAI(): GoogleGenAI | undefined {
  if (!config.GOOGLE_AI_API_KEY) return undefined;
  if (!instance) {
    instance = new GoogleGenAI({ apiKey: config.GOOGLE_AI_API_KEY });
  }
  return instance;
}
