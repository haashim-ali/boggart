import type { GoogleGenAI } from '@google/genai';
import type { MediaStatus } from '@boggart/shared';

/** Generate an image from a text prompt via Nano Banana Pro (gemini-3-pro-image-preview) */
export async function generateImage(
  ai: GoogleGenAI,
  prompt: string,
): Promise<MediaStatus> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: prompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const data = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType ?? 'image/png';

    if (!data) {
      return { status: 'failed', error: 'No image data in response' };
    }

    return { status: 'completed', url: `data:${mimeType};base64,${data}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image generation failed';
    console.error('[google-ai/image] generation failed:', message);
    return { status: 'failed', error: message };
  }
}
