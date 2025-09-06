
import React from 'react';
import { GalleryIcon } from './icons';

interface HeaderProps {
    onGalleryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGalleryClick }) => {
    return (
        <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
                    FaceMedia <span className="text-indigo-400">Studio</span>
                </h1>
                <button
                    onClick={onGalleryClick}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors duration-200 text-sm font-semibold"
                >
                    <GalleryIcon />
                    My Creations
                </button>
            </div>
        </header>
    );
};
