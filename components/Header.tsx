
import React, { useState, useRef, useEffect } from 'react';
import { GalleryIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    onGalleryClick: () => void;
}

const UserMenu: React.FC = () => {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
                <img
                    src={user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user.displayName}`}
                    alt={user.displayName || 'User Avatar'}
                    className="w-8 h-8 rounded-full"
                />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 border-b border-slate-600">
                        <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={signOut}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}

export const Header: React.FC<HeaderProps> = ({ onGalleryClick }) => {
    const { user } = useAuth();
    
    return (
        <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
                    FaceMedia <span className="text-indigo-400">Studio</span>
                </h1>
                {user && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onGalleryClick}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors duration-200 text-sm font-semibold"
                        >
                            <GalleryIcon />
                            My Creations
                        </button>
                        <UserMenu />
                    </div>
                )}
            </div>
        </header>
    );
};