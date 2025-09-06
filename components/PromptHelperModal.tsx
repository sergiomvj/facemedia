
import React, { useState } from 'react';
import { CloseIcon, WandIcon } from './icons';
import { buildCreativePrompt } from '../services/geminiService';
import { Spinner } from './Spinner';
import type { PromptHelperTab } from '../types';

// This is a simplified i18n implementation for demonstration
const translations = {
    en: {
        title: "Prompt Helper",
        tabs: {
            guide: "Prompt Guide",
            builder: "Prompt Builder",
            styles: "Styles & Keywords",
            negative: "Negative Prompts",
        },
        guide: {
            title: "Crafting the Perfect Prompt",
            desc: "A great prompt is specific and descriptive. Follow a structured order to give the AI the clearest possible instruction. Think of it like building a recipe.",
            structure_title: "Recommended Structure:",
            step1_title: "1. Prefix/Medium",
            step1_desc: "Start with the type of image. (e.g., `A cinematic photo of...`, `An oil painting of...`, `A 3D render of...`)",
            step2_title: "2. Subject",
            step2_desc: "Clearly describe the main focus. What is it? What is it doing? (e.g., `...a lone astronaut sitting on a crater...`)",
            step3_title: "3. Details & Setting",
            step3_desc: "Add important details about the subject and its environment. (e.g., `...wearing a retro-futuristic silver suit, looking at a shattered Earth in the dark sky...`)",
            step4_title: "4. Style & Artist (Optional)",
            step4_desc: "Specify an art style, or mention artists to influence the look. (e.g., `...in the style of a vintage sci-fi book cover, art by Syd Mead.`)",
            step5_title: "5. Composition & Lighting",
            step5_desc: "Describe the camera shot, lighting, and overall mood. (e.g., `...dramatic lighting, volumetric rays, wide-angle shot, epic scale, moody atmosphere.`)",
            example_title: "Full Example:",
            example_prompt: "A cinematic photo of a lone astronaut sitting on a crater on the moon, wearing a retro-futuristic silver suit, looking at a shattered Earth in the dark sky, in the style of a vintage sci-fi book cover, art by Syd Mead, dramatic lighting, volumetric rays, wide-angle shot, epic scale, moody atmosphere.",
        },
        builder: {
            title: "Let's build a great prompt!",
            desc: "Provide some keywords and let AI expand on your idea.",
            label: "Your keywords (e.g., 'cat, astronaut, space')",
            button: "Generate Prompt",
            result: "AI Generated Prompt:",
            use: "Use this Prompt"
        },
        styles: {
            photo: "Photography Styles",
            art: "Art Styles",
            artists: "Artists",
            lighting: "Lighting",
        },
        negative: {
            title: "What are Negative Prompts?",
            desc: "They tell the AI what to AVOID. Use them to remove unwanted elements, fix common issues (like bad hands), or refine the style.",
            common: "Common Negative Keywords",
        }
    },
    'pt-br': {
        title: "Assistente de Prompt",
        tabs: {
            guide: "Guia de Prompt",
            builder: "Construtor de Prompt",
            styles: "Estilos e Palavras-chave",
            negative: "Prompts Negativos",
        },
        guide: {
            title: "Criando o Prompt Perfeito",
            desc: "Um bom prompt é específico e descritivo. Siga uma ordem estruturada para dar à IA a instrução mais clara possível. Pense nisso como construir uma receita.",
            structure_title: "Estrutura Recomendada:",
            step1_title: "1. Prefixo/Mídia",
            step1_desc: "Comece com o tipo de imagem. (ex: `Uma foto cinematográfica de...`, `Uma pintura a óleo de...`, `Uma renderização 3D de...`)",
            step2_title: "2. Sujeito",
            step2_desc: "Descreva claramente o foco principal. O que é? O que está fazendo? (ex: `...um astronauta solitário sentado em uma cratera...`)",
            step3_title: "3. Detalhes e Cenário",
            step3_desc: "Adicione detalhes importantes sobre o sujeito e seu ambiente. (ex: `...vestindo um traje prateado retro-futurista, olhando para uma Terra estilhaçada no céu escuro...`)",
            step4_title: "4. Estilo e Artista (Opcional)",
            step4_desc: "Especifique um estilo de arte ou mencione artistas para influenciar a aparência. (ex: `...no estilo de uma capa de livro de ficção científica vintage, arte de Syd Mead.`)",
            step5_title: "5. Composição e Iluminação",
            step5_desc: "Descreva o enquadramento da câmera, a iluminação e o clima geral. (ex: `...iluminação dramática, raios volumétricos, foto em grande angular, escala épica, atmosfera melancólica.`)",
            example_title: "Exemplo Completo:",
            example_prompt: "Uma foto cinematográfica de um astronauta solitário sentado em uma cratera na lua, vestindo um traje prateado retro-futurista, olhando para uma Terra estilhaçada no céu escuro, no estilo de uma capa de livro de ficção científica vintage, arte de Syd Mead, iluminação dramática, raios volumétricos, foto em grande angular, escala épica, atmosfera melancólica.",
        },
        builder: {
            title: "Vamos criar um ótimo prompt!",
            desc: "Forneça algumas palavras-chave e deixe a IA expandir sua ideia.",
            label: "Suas palavras-chave (ex: 'gato, astronauta, espaço')",
            button: "Gerar Prompt",
            result: "Prompt Gerado por IA:",
            use: "Usar este Prompt"
        },
        styles: {
            photo: "Estilos de Fotografia",
            art: "Estilos de Arte",
            artists: "Artistas",
            lighting: "Iluminação",
        },
        negative: {
            title: "O que são Prompts Negativos?",
            desc: "Eles dizem à IA o que EVITAR. Use-os para remover elementos indesejados, corrigir problemas comuns (como mãos ruins) ou refinar o estilo.",
            common: "Palavras-chave Negativas Comuns",
        }
    }
};

const keywordCategories = {
    photo: ['Cinematic', 'Documentary Photography', 'Fashion Photography', 'Film Noir', 'Golden Hour', 'Long Exposure', 'Macro Photography', 'Portrait Photography', 'Street Photography'],
    art: ['Abstract', 'Art Deco', 'Art Nouveau', 'Bauhaus', 'Concept Art', 'Cubism', 'Cyberpunk', 'Digital Painting', 'Fantasy', 'Impressionism', 'Minimalism', 'Pop Art', 'Steampunk', 'Surrealism', 'Synthwave', 'Ukiyo-e', 'Vaporwave'],
    artists: ['Ansel Adams', 'Hayao Miyazaki', 'Frida Kahlo', 'Greg Rutkowski', 'H.R. Giger', 'Salvador Dalí', 'Studio Ghibli', 'Tim Burton', 'Vincent van Gogh', 'Wes Anderson'],
    lighting: ['Backlighting', 'Blue Hour', 'Dramatic Lighting', 'Hard Lighting', 'Natural Lighting', 'Neon Lighting', 'Soft Lighting', 'Studio Lighting', 'Volumetric Lighting'],
};

const negativeKeywords = ['ugly', 'blurry', 'low quality', 'jpeg artifacts', 'bad anatomy', 'malformed', 'deformed', 'disfigured', 'poorly drawn hands', 'poorly drawn feet', 'extra limbs', 'extra fingers', 'mutated hands', 'watermark', 'signature', 'text', 'logo'];

const TABS_ORDER: PromptHelperTab[] = ['guide', 'builder', 'styles', 'negative'];

type Language = 'en' | 'pt-br';

interface PromptHelperModalProps {
    initialTab?: PromptHelperTab;
    onClose: () => void;
    onApplyPrompt: (prompt: string) => void;
    onAppendToPrompt: (text: string) => void;
}

const KeywordButton: React.FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => (
    <button onClick={onClick} className="px-3 py-1 bg-slate-600 text-sm rounded-full hover:bg-indigo-500 transition-colors">{text}</button>
);

const PromptGuideTab: React.FC<{ lang: Language, onAppend: (t: string) => void }> = ({ lang, onAppend }) => {
    const t = translations[lang].guide;
    return (
        <div className="space-y-6 text-sm text-slate-300">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-indigo-400">{t.title}</h3>
                <p className="text-slate-400">{t.desc}</p>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold text-slate-200">{t.structure_title}</h4>
                <ul className="space-y-3 pl-4 border-l-2 border-slate-700">
                    <li><strong className="font-semibold text-indigo-400">{t.step1_title}:</strong> <span className="text-slate-400">{t.step1_desc}</span></li>
                    <li><strong className="font-semibold text-indigo-400">{t.step2_title}:</strong> <span className="text-slate-400">{t.step2_desc}</span></li>
                    <li><strong className="font-semibold text-indigo-400">{t.step3_title}:</strong> <span className="text-slate-400">{t.step3_desc}</span></li>
                    <li><strong className="font-semibold text-indigo-400">{t.step4_title}:</strong> <span className="text-slate-400">{t.step4_desc}</span></li>
                    <li><strong className="font-semibold text-indigo-400">{t.step5_title}:</strong> <span className="text-slate-400">{t.step5_desc}</span></li>
                </ul>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold text-slate-200">{t.example_title}</h4>
                <div className="bg-slate-900 p-3 rounded-md">
                    <p className="text-sm text-slate-300 border-l-2 border-indigo-500 pl-3 leading-relaxed cursor-pointer hover:bg-slate-700/50" onClick={() => onAppend(t.example_prompt)} title="Click to use this example">{t.example_prompt}</p>
                </div>
            </div>
        </div>
    );
};

const PromptBuilder: React.FC<{ lang: Language, onApplyPrompt: (p: string) => void }> = ({ lang, onApplyPrompt }) => {
    const t = translations[lang].builder;
    const [keywords, setKeywords] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!keywords.trim()) return;
        setIsLoading(true);
        setResult('');
        try {
            const generatedPrompt = await buildCreativePrompt(keywords);
            setResult(generatedPrompt);
        } catch (error) {
            console.error(error);
            setResult("Failed to generate prompt. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-400">{t.title}</h3>
            <p className="text-sm text-slate-400">{t.desc}</p>
            <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={t.label}
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 transition text-sm"
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:bg-slate-600 transition">
                {isLoading ? <Spinner /> : <WandIcon />}
                {isLoading ? 'Generating...' : t.button}
            </button>
            {result && (
                <div className="bg-slate-900 p-4 rounded-md space-y-3">
                    <p className="font-semibold">{t.result}</p>
                    <p className="text-sm text-slate-300 border-l-2 border-indigo-500 pl-3">{result}</p>
                    <button onClick={() => onApplyPrompt(result)} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition">{t.use}</button>
                </div>
            )}
        </div>
    );
};

const StylesTab: React.FC<{ lang: Language, onAppend: (t: string) => void }> = ({ lang, onAppend }) => {
    const t = translations[lang].styles;
    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-indigo-400 mb-2">{t.photo}</h3>
                <div className="flex flex-wrap gap-2">{keywordCategories.photo.map(k => <KeywordButton key={k} text={k} onClick={() => onAppend(k)} />)}</div>
            </div>
            <div>
                <h3 className="font-semibold text-indigo-400 mb-2">{t.art}</h3>
                <div className="flex flex-wrap gap-2">{keywordCategories.art.map(k => <KeywordButton key={k} text={k} onClick={() => onAppend(k)} />)}</div>
            </div>
            <div>
                <h3 className="font-semibold text-indigo-400 mb-2">{t.artists}</h3>
                <div className="flex flex-wrap gap-2">{keywordCategories.artists.map(k => <KeywordButton key={k} text={k} onClick={() => onAppend(k)} />)}</div>
            </div>
             <div>
                <h3 className="font-semibold text-indigo-400 mb-2">{t.lighting}</h3>
                <div className="flex flex-wrap gap-2">{keywordCategories.lighting.map(k => <KeywordButton key={k} text={k} onClick={() => onAppend(k)} />)}</div>
            </div>
        </div>
    );
};

const NegativeTab: React.FC<{ lang: Language, onAppend: (t: string) => void }> = ({ lang, onAppend }) => {
    const t = translations[lang].negative;
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-400">{t.title}</h3>
            <p className="text-sm text-slate-400">{t.desc}</p>
             <div>
                <h3 className="font-semibold text-indigo-400 mb-2">{t.common}</h3>
                <div className="flex flex-wrap gap-2">{negativeKeywords.map(k => <KeywordButton key={k} text={k} onClick={() => onAppend(k)} />)}</div>
            </div>
        </div>
    );
};

export const PromptHelperModal: React.FC<PromptHelperModalProps> = ({ initialTab, onClose, onApplyPrompt, onAppendToPrompt }) => {
    const [activeTab, setActiveTab] = useState<PromptHelperTab>(initialTab || 'guide');
    const [language, setLanguage] = useState<Language>('en');
    const t = translations[language];
    
    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 w-full max-w-2xl h-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">{t.title}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex text-sm bg-slate-700 p-1 rounded-md">
                           <button onClick={() => setLanguage('en')} className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-indigo-600' : ''}`}>EN</button>
                           <button onClick={() => setLanguage('pt-br')} className={`px-2 py-0.5 rounded ${language === 'pt-br' ? 'bg-indigo-600' : ''}`}>PT-BR</button>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="border-b border-slate-700 px-4 flex-shrink-0">
                    <nav className="flex gap-4 -mb-px">
                        {TABS_ORDER.map(tabKey => (
                             <button 
                                key={tabKey} 
                                onClick={() => setActiveTab(tabKey)}
                                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tabKey ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
                                {t.tabs[tabKey]}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    {activeTab === 'guide' && <PromptGuideTab lang={language} onAppend={onAppendToPrompt} />}
                    {activeTab === 'builder' && <PromptBuilder lang={language} onApplyPrompt={onApplyPrompt} />}
                    {activeTab === 'styles' && <StylesTab lang={language} onAppend={onAppendToPrompt} />}
                    {activeTab === 'negative' && <NegativeTab lang={language} onAppend={(text) => onAppendToPrompt(text)} />}
                </div>
            </div>
        </div>
    );
};
