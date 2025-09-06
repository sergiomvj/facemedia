
import React from 'react';
import type { Mode, ImageFile, AspectRatio, PromptHelperTab } from '../types';
import { ImageUploader } from './ImageUploader';
import { AspectRatioSelector } from './AspectRatioSelector';
import { Spinner } from './Spinner';
import { EditIcon, LightbulbIcon, TranslateIcon, TrashIcon, WandIcon } from './icons';

interface ControlPanelProps {
    mode: Mode;
    setMode: (mode: Mode) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    negativePrompt: string;
    setNegativePrompt: (prompt: string) => void;
    baseImage: ImageFile | null;
    blendImage: ImageFile | null;
    onImageUpload: (file: File, type: 'base' | 'blend') => void;
    removeImage: (type: 'base' | 'blend') => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    isLoading: boolean;
    loadingMessage: string;
    onGenerate: () => void;
    onClearAll: () => void;
    onTranslate: (text: string, type: 'main' | 'negative') => void;
    onOpenPromptEditor: () => void;
    onOpenNegativePromptEditor: () => void;
    onOpenPromptHelper: (tab: PromptHelperTab) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const {
        mode, setMode, prompt, setPrompt, negativePrompt, setNegativePrompt,
        baseImage, blendImage, onImageUpload, removeImage,
        aspectRatio, setAspectRatio, isLoading, loadingMessage,
        onGenerate, onClearAll, onTranslate, onOpenPromptEditor, onOpenNegativePromptEditor, onOpenPromptHelper
    } = props;
    
    const isEditingImage = mode === 'Image' && !!baseImage;

    const getButtonText = () => {
        if (mode === 'Video') return 'Generate Video';
        if (isEditingImage) return 'Generate';
        return 'Create';
    };

    return (
        <div className="bg-slate-800 rounded-lg p-4 space-y-6 h-full flex flex-col">
            <div className="flex-grow space-y-6">
                {/* Mode Toggle */}
                <div className="flex bg-slate-700 rounded-lg p-1">
                    <button
                        onClick={() => setMode('Image')}
                        className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'Image' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
                    >
                        Image
                    </button>
                    <button
                        onClick={() => setMode('Video')}
                        className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'Video' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
                    >
                        Video
                    </button>
                </div>

                {/* Base Image */}
                {(mode === 'Video' || mode === 'Image') && (
                     <ImageUploader label="Base Image" imageFile={baseImage} onImageUpload={(f) => onImageUpload(f, 'base')} onRemove={() => removeImage('base')} />
                )}

                {/* Main Prompt */}
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1">Describe Your Vision</label>
                    <div className="relative">
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={mode === 'Image' ? 'e.g., A cinematic photo of a robot in a neon-lit city...' : 'e.g., A drone shot of a futuristic city at sunset...'}
                            rows={5}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm pr-10"
                            disabled={isLoading}
                        />
                         <div className="absolute top-2 right-2 flex flex-col gap-2">
                             <button onClick={() => onTranslate(prompt, 'main')} title="Translate to English" className="p-1.5 bg-slate-600/50 hover:bg-slate-500/80 rounded-full text-slate-300 transition"><TranslateIcon className="w-4 h-4" /></button>
                             <button onClick={onOpenPromptEditor} title="Expand Prompt" className="p-1.5 bg-slate-600/50 hover:bg-slate-500/80 rounded-full text-slate-300 transition"><EditIcon className="w-4 h-4" /></button>
                             <button onClick={() => onOpenPromptHelper('guide')} title="Prompting Tips" className="p-1.5 bg-slate-600/50 hover:bg-slate-500/80 rounded-full text-slate-300 transition"><LightbulbIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Blend Image (Image Edit Mode Only) */}
                {isEditingImage && (
                    <ImageUploader label="Blend Image (Optional)" imageFile={blendImage} onImageUpload={(f) => onImageUpload(f, 'blend')} onRemove={() => removeImage('blend')} />
                )}

                {/* Negative Prompt (Image Create Mode Only) */}
                {mode === 'Image' && !isEditingImage && (
                    <div>
                        <label htmlFor="negative-prompt" className="block text-sm font-medium text-slate-300 mb-1">Negative Prompt (Optional)</label>
                         <div className="relative">
                            <textarea
                                id="negative-prompt"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="e.g., blurry, low quality, cartoon"
                                rows={2}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm pr-10"
                                disabled={isLoading}
                            />
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                                <button onClick={() => onTranslate(negativePrompt, 'negative')} title="Translate to English" className="p-1.5 bg-slate-600/50 hover:bg-slate-500/80 rounded-full text-slate-300 transition"><TranslateIcon className="w-4 h-4" /></button>
                                <button onClick={onOpenNegativePromptEditor} title="Expand Negative Prompt" className="p-1.5 bg-slate-600/50 hover:bg-slate-500/80 rounded-full text-slate-300 transition"><EditIcon className="w-4 h-4" /></button>
                                <button onClick={() => onOpenPromptHelper('negative')} title="Negative Prompting Tips" className="p-1.5 bg-slate-600/50 hover:bg-slate-500/80 rounded-full text-slate-300 transition"><LightbulbIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Aspect Ratio (Image Create Mode Only) */}
                {mode === 'Image' && !isEditingImage && (
                    <AspectRatioSelector selectedRatio={aspectRatio} onSelectRatio={setAspectRatio} />
                )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex-shrink-0 space-y-2">
                <button
                    onClick={onGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <Spinner /> : <WandIcon />}
                    {isLoading ? loadingMessage || 'Generating...' : getButtonText()}
                </button>
                <button
                    onClick={onClearAll}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-slate-700 text-slate-300 font-semibold rounded-md hover:bg-slate-600 disabled:opacity-50 transition-colors text-sm"
                >
                    <TrashIcon />
                    Clear All
                </button>
            </div>
        </div>
    );
};
