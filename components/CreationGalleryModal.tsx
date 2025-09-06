
import React from 'react';
import type { Creation } from '../types';
import { CloseIcon, DeleteIcon, ReloadIcon, PlayIcon } from './icons';

interface CreationGalleryModalProps {
    creations: Creation[];
    onClose: () => void;
    onReload: (creation: Creation) => void;
    onDelete: (id: number) => void;
}

const CreationCard: React.FC<{ creation: Creation, onReload: () => void, onDelete: () => void }> = ({ creation, onReload, onDelete }) => {
    const thumbnailSrc = creation.result.type === 'image' 
        ? creation.result.src 
        : (creation.baseImage ? `data:${creation.baseImage.mimeType};base64,${creation.baseImage.data}` : undefined);
    
    return (
        <div className="relative group aspect-square bg-slate-700 rounded-lg overflow-hidden">
            {thumbnailSrc ? (
                 <img src={thumbnailSrc} alt={creation.prompt} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <PlayIcon className="w-12 h-12 text-slate-500" />
                </div>
            )}
           
            {creation.result.type === 'video' && (
                <div className="absolute top-2 left-2 p-1.5 bg-black/50 rounded-full">
                    <PlayIcon className="w-4 h-4 text-white" />
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-xs text-white line-clamp-3 mb-2">{creation.prompt}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onReload} title="Reload Creation" className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors">
                        <ReloadIcon className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} title="Delete Creation" className="p-2 bg-red-600 rounded-full hover:bg-red-500 transition-colors">
                        <DeleteIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CreationGalleryModal: React.FC<CreationGalleryModalProps> = ({ creations, onClose, onReload, onDelete }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 w-full max-w-4xl h-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">My Creations</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    {creations.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {creations.map(c => (
                                <CreationCard key={c.id} creation={c} onReload={() => onReload(c)} onDelete={() => onDelete(c.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <p className="text-lg">Your gallery is empty.</p>
                            <p>Start creating to see your work here!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
