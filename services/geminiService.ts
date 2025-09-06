
import { GoogleGenAI, GenerateContentResponse, Modality, Type, VideosOperation } from "@google/genai";
import type { ImageFile, MediaResult, AspectRatio, GeminiImageGenConfig } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert ImageFile to Gemini Part
const imageFileToPart = (imageFile: ImageFile) => ({
    inlineData: {
        data: imageFile.data,
        mimeType: imageFile.mimeType,
    },
});

export const generateImage = async (prompt: string, negativePrompt: string, aspectRatio: AspectRatio): Promise<MediaResult> => {
    if (!prompt) throw new Error("Prompt is required for image generation.");

    const fullPrompt = negativePrompt ? `${prompt}, negative prompt: ${negativePrompt}` : prompt;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        } as GeminiImageGenConfig,
    });
    
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    return { type: 'image', src: imageUrl };
};

export const editImage = async (prompt: string, baseImage: ImageFile, blendImage: ImageFile | null): Promise<MediaResult> => {
    const parts: any[] = [imageFileToPart(baseImage)];
    if (blendImage) {
        parts.push(imageFileToPart(blendImage));
    }
    if (prompt) {
        parts.push({ text: prompt });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let resultText = '';
    let resultImageSrc = '';

    for (const part of response.candidates[0].content.parts) {
        if (part.text) {
            resultText += part.text;
        } else if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            resultImageSrc = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }

    if (!resultImageSrc) throw new Error("The AI did not return an image. Try a different prompt.");

    return { type: 'image', src: resultImageSrc, text: resultText };
};

export const generateVideo = async (prompt: string, baseImage: ImageFile | null): Promise<MediaResult> => {
    if (!prompt) throw new Error("Prompt is required for video generation.");
    
    let operation: VideosOperation;

    if (baseImage) {
        operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt,
            image: {
                imageBytes: baseImage.data,
                mimeType: baseImage.mimeType,
            },
            config: { numberOfVideos: 1 }
        });
    } else {
        operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt,
            config: { numberOfVideos: 1 }
        });
    }

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was provided.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return { type: 'video', src: videoUrl };
};

export const translateText = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text to English, returning only the translated text: "${text}"`,
    });
    return response.text.trim();
};

export const buildCreativePrompt = async (keywords: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on these keywords: "${keywords}", create a detailed, creative, and well-structured image generation prompt. The prompt should be evocative and provide clear instructions for an AI image generator. Return only the generated prompt.`,
    });
    return response.text.trim();
};
