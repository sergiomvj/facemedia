
import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface PromptEditorModalProps {
    title?: string;
    initialPrompt: string;
    onClose: () => void;
    onSave: (prompt: string) => void;
}

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({ title, initialPrompt, onClose, onSave }) => {
    const [prompt, setPrompt] = useState(initialPrompt);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 w-full max-w-2xl h-full max-h-[70vh] rounded-lg shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">{title || 'Prompt Editor'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-grow p-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-full bg-slate-900 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-base resize-none"
                        placeholder="Write your detailed prompt here..."
                    />
                </div>
                <div className="flex-shrink-0 p-4 border-t border-slate-700 flex justify-end">
                    <button
                        onClick={() => onSave(prompt)}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors"
                    >
                        Save and Close
                    </button>
                </div>
            </div>
        </div>
    );
};
