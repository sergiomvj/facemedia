
import React, { useState, useRef, useCallback } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon, TrashIcon } from './icons';

interface ImageUploaderProps {
    label: string;
    imageFile: ImageFile | null;
    onImageUpload: (file: File) => void;
    onRemove: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, imageFile, onImageUpload, onRemove }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    }, [onImageUpload]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onImageUpload(e.target.files[0]);
        }
    };

    if (imageFile) {
        return (
            <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
                 <div className="relative group">
                    <img src={`data:${imageFile.mimeType};base64,${imageFile.data}`} alt="Uploaded preview" className="w-full h-24 object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onRemove} className="p-2 bg-red-600/80 rounded-full text-white hover:bg-red-500/80 transition">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-slate-700' : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-xs text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                </div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
        </div>
    );
};
