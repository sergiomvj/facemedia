
import React, { useState, useEffect, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { MediaDisplay } from './components/MediaDisplay';
import { Header } from './components/Header';
import { CreationGalleryModal } from './components/CreationGalleryModal';
import { PromptHelperModal } from './components/PromptHelperModal';
import { PromptEditorModal } from './components/PromptEditorModal';
import { LoginScreen } from './components/LoginScreen';
import { Spinner } from './components/Spinner';
import { useAuth } from './contexts/AuthContext';
import { addCreation, getCreations, deleteCreation as dbDeleteCreation } from './services/dbService';
import * as geminiService from './services/geminiService';
import { VIDEO_GENERATION_MESSAGES } from './constants';
import type { Mode, ImageFile, MediaResult, Creation, AspectRatio, PromptHelperTab } from './types';
import { fileToBase64 } from './utils/fileUtils';

const MAX_HISTORY_LENGTH = 20;

const App: React.FC = () => {
    const { user, loading: authLoading } = useAuth();

    const initialState = {
        mode: 'Image' as Mode,
        prompt: '',
        negativePrompt: '',
        baseImage: null as ImageFile | null,
        blendImage: null as ImageFile | null,
        aspectRatio: '1:1' as AspectRatio,
        mediaResult: null as MediaResult | null,
    };

    const [mode, setMode] = useState<Mode>(initialState.mode);
    const [prompt, setPrompt] = useState<string>(initialState.prompt);
    const [negativePrompt, setNegativePrompt] = useState<string>(initialState.negativePrompt);
    const [baseImage, setBaseImage] = useState<ImageFile | null>(initialState.baseImage);
    const [blendImage, setBlendImage] = useState<ImageFile | null>(initialState.blendImage);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialState.aspectRatio);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [mediaResult, setMediaResult] = useState<MediaResult | null>(initialState.mediaResult);

    const [isGalleryOpen, setGalleryOpen] = useState<boolean>(false);
    const [creations, setCreations] = useState<Creation[]>([]);
    const [isPromptHelperOpen, setPromptHelperOpen] = useState<boolean>(false);
    const [isPromptEditorOpen, setPromptEditorOpen] = useState<boolean>(false);
    const [isNegativePromptEditorOpen, setNegativePromptEditorOpen] = useState<boolean>(false);
    const [initialHelperTab, setInitialHelperTab] = useState<PromptHelperTab>('guide');

    const [promptHistory, setPromptHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem('promptHistory') || '[]'));
    const [negativePromptHistory, setNegativePromptHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem('negativePromptHistory') || '[]'));

    useEffect(() => {
        localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
    }, [promptHistory]);

    useEffect(() => {
        localStorage.setItem('negativePromptHistory', JSON.stringify(negativePromptHistory));
    }, [negativePromptHistory]);

    const isEditingImage = mode === 'Image' && !!baseImage;

    const loadCreations = useCallback(async () => {
        if (!user) return;
        const items = await getCreations(user.uid);
        setCreations(items);
    }, [user]);

    useEffect(() => {
        loadCreations();
    }, [loadCreations]);

    const handleClearAll = () => {
        setMode(initialState.mode);
        setPrompt(initialState.prompt);
        setNegativePrompt(initialState.negativePrompt);
        setBaseImage(initialState.baseImage);
        setBlendImage(initialState.blendImage);
        setAspectRatio(initialState.aspectRatio);
        setMediaResult(initialState.mediaResult);
    };

    const saveAndSetResult = async (result: MediaResult) => {
        if (!user) return;
        setMediaResult(result);
        const creation: Omit<Creation, 'id'> = {
            userId: user.uid,
            mode,
            prompt,
            negativePrompt,
            baseImage,
            blendImage,
            aspectRatio,
            result,
        };
        await addCreation(creation);
        await loadCreations();
    };

    const updateHistory = (
      text: string, 
      history: string[], 
      setHistory: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;
        
        const newHistory = [trimmedText, ...history.filter(item => item !== trimmedText)];
        setHistory(newHistory.slice(0, MAX_HISTORY_LENGTH));
    };

    const handleGenerate = async () => {
        if (!user) return;
        setIsLoading(true);
        setMediaResult(null);

        updateHistory(prompt, promptHistory, setPromptHistory);
        if (negativePrompt) {
          updateHistory(negativePrompt, negativePromptHistory, setNegativePromptHistory);
        }

        try {
            if (mode === 'Image') {
                if (isEditingImage) {
                    setLoadingMessage('Editing image...');
                    if (!baseImage) throw new Error("Base image is required for editing.");
                    const result = await geminiService.editImage(prompt, baseImage, blendImage);
                    await saveAndSetResult(result);
                } else {
                    setLoadingMessage('Creating new image...');
                    const result = await geminiService.generateImage(prompt, negativePrompt, aspectRatio);
                    await saveAndSetResult({ type: 'image', src: result.src });
                }
            } else if (mode === 'Video') {
                let messageIndex = 0;
                const messageInterval = setInterval(() => {
                    setLoadingMessage(VIDEO_GENERATION_MESSAGES[messageIndex % VIDEO_GENERATION_MESSAGES.length]);
                    messageIndex++;
                }, 3000);

                const result = await geminiService.generateVideo(prompt, baseImage);
                clearInterval(messageInterval);
                await saveAndSetResult(result);
            }
        } catch (error) {
            console.error("Generation failed:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setMediaResult({ type: 'text', text: `Error: ${errorMessage}` });
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleUseAsBase = () => {
        if (mediaResult?.type === 'image') {
            setBaseImage({ data: mediaResult.src, mimeType: 'image/png', name: 'generated-image.png' });
            setMediaResult(null);
            setBlendImage(null);
            setMode('Image');
        }
    };

    const handleTranslatePrompt = async (text: string, type: 'main' | 'negative') => {
        if (!text.trim()) return;
        setIsLoading(true);
        setLoadingMessage('Translating...');
        try {
            const translatedText = await geminiService.translateText(text);
            if (type === 'main') {
                setPrompt(translatedText);
            } else {
                setNegativePrompt(translatedText);
            }
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleReloadCreation = (creation: Creation) => {
        setMode(creation.mode);
        setPrompt(creation.prompt);
        setNegativePrompt(creation.negativePrompt);
        setBaseImage(creation.baseImage);
        setBlendImage(creation.blendImage);
        setAspectRatio(creation.aspectRatio as AspectRatio);
        setMediaResult(creation.result);
        setGalleryOpen(false);
    };

    const handleDeleteCreation = async (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this creation?')) {
            await dbDeleteCreation(id);
            await loadCreations();
        }
    };
    
    const handleImageUpload = async (file: File, type: 'base' | 'blend') => {
        const { data, mimeType } = await fileToBase64(file);
        const imageFile = { data, mimeType, name: file.name };
        if (type === 'base') {
            setBaseImage(imageFile);
        } else {
            setBlendImage(imageFile);
        }
    };
    
    const openPromptHelper = (tab: PromptHelperTab = 'guide') => {
        setInitialHelperTab(tab);
        setPromptHelperOpen(true);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex justify-center items-center">
                <Spinner className="w-10 h-10" />
            </div>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
            <Header onGalleryClick={() => setGalleryOpen(true)} />
            <main className="flex-grow container mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 lg:col-span-3">
                    <ControlPanel
                        mode={mode}
                        setMode={setMode}
                        prompt={prompt}
                        setPrompt={setPrompt}
                        negativePrompt={negativePrompt}
                        setNegativePrompt={setNegativePrompt}
                        baseImage={baseImage}
                        blendImage={blendImage}
                        onImageUpload={handleImageUpload}
                        removeImage={(type) => type === 'base' ? setBaseImage(null) : setBlendImage(null)}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        onGenerate={handleGenerate}
                        onClearAll={handleClearAll}
                        onTranslate={handleTranslatePrompt}
                        onOpenPromptEditor={() => setPromptEditorOpen(true)}
                        onOpenNegativePromptEditor={() => setNegativePromptEditorOpen(true)}
                        onOpenPromptHelper={openPromptHelper}
                        promptHistory={promptHistory}
                        negativePromptHistory={negativePromptHistory}
                    />
                </div>
                <div className="md:col-span-8 lg:col-span-9">
                    <MediaDisplay
                        mediaResult={mediaResult}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        onUseAsBase={handleUseAsBase}
                    />
                </div>
            </main>
            {isGalleryOpen && (
                <CreationGalleryModal
                    creations={creations}
                    onClose={() => setGalleryOpen(false)}
                    onReload={handleReloadCreation}
                    onDelete={handleDeleteCreation}
                />
            )}
            {isPromptHelperOpen && (
                <PromptHelperModal
                    initialTab={initialHelperTab}
                    onClose={() => setPromptHelperOpen(false)}
                    onApplyPrompt={(newPrompt) => {
                        setPrompt(newPrompt);
                        setPromptHelperOpen(false);
                    }}
                    onAppendToPrompt={(text) => setPrompt(p => `${p} ${text}`.trim())}
                />
            )}
            {isPromptEditorOpen && (
                <PromptEditorModal
                    title="Prompt Editor"
                    initialPrompt={prompt}
                    onClose={() => setPromptEditorOpen(false)}
                    onSave={(newPrompt) => {
                        setPrompt(newPrompt);
                        setPromptEditorOpen(false);
                    }}
                />
            )}
            {isNegativePromptEditorOpen && (
                <PromptEditorModal
                    title="Negative Prompt Editor"
                    initialPrompt={negativePrompt}
                    onClose={() => setNegativePromptEditorOpen(false)}
                    onSave={(newPrompt) => {
                        setNegativePrompt(newPrompt);
                        setNegativePromptEditorOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default App;