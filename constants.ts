
import type { AspectRatio, StylePreset } from './types';

export const ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const STYLE_PRESETS: StylePreset[] = [
    {
        name: 'Cinematic',
        prompt: 'cinematic, dramatic lighting, high detail, film grain, epic composition, anamorphic lens flare',
        negativePrompt: 'illustration, painting, flat, cartoon, 2d',
    },
    {
        name: 'Vintage',
        prompt: 'vintage photo, sepia tone, old-fashioned, retro, 1950s, faded colors, grainy texture',
        negativePrompt: 'modern, futuristic, vibrant colors, digital art',
    },
    {
        name: 'Cyberpunk',
        prompt: 'cyberpunk style, neon lighting, futuristic city, dystopian, high-tech, Blade Runner aesthetic, holographic displays',
        negativePrompt: 'natural, clean, historical, daytime, pastel',
    },
    {
        name: 'Pastel',
        prompt: 'pastel colors, soft, dreamy, ethereal, light and airy, gentle gradients, low contrast',
        negativePrompt: 'dark, neon, high contrast, grunge, cyberpunk',
    },
    {
        name: 'Anime',
        prompt: 'anime style, vibrant, cel-shaded, Japanese animation, Studio Ghibli inspired, detailed background art',
        negativePrompt: 'photorealistic, 3d render, realistic',
    },
    {
        name: 'Photorealistic',
        prompt: 'photorealistic, hyperrealistic, 8k, sharp focus, detailed, high resolution photography, DSLR',
        negativePrompt: 'painting, drawing, sketch, anime, cartoon',
    },
    {
        name: '3D Render',
        prompt: '3D render, octane render, unreal engine, Blender, high quality, detailed textures, physically based rendering',
        negativePrompt: 'photo, painting, 2d, flat',
    },
];

export const VIDEO_GENERATION_MESSAGES: string[] = [
    'Initializing video engine...',
    'Warming up the pixels...',
    'Composing your masterpiece...',
    'Polling for result... this can take a few minutes.',
    'Almost there, adding the finishing touches...',
    'Finalizing video stream...',
    'Gathering stardust for your scene...'
];
