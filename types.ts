
export type Mode = 'Image' | 'Video' | 'Tools';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type PromptHelperTab = 'guide' | 'builder' | 'styles' | 'negative';

export interface ImageFile {
  data: string; // base64 encoded image
  mimeType: string;
  name: string;
}

export interface MediaResult {
  type: 'image' | 'video' | 'text';
  src?: string; // base64 for image, blob url for video
  text?: string;
}

export interface StylePreset {
  name: string;
  prompt: string;
  negativePrompt: string;
}

export interface Creation {
  id: number; // Using timestamp as ID
  userId: string; // Firebase User UID
  mode: Mode;
  prompt: string;
  negativePrompt: string;
  baseImage: ImageFile | null;
  blendImage: ImageFile | null;
  aspectRatio: string;
  result: MediaResult;
  videoLength?: number;
  frameRate?: number;
  stylePreset?: string;
}

export type GeminiImageGenConfig = {
    numberOfImages: number;
    outputMimeType: 'image/jpeg' | 'image/png';
    aspectRatio: AspectRatio;
};
