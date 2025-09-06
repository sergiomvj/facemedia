
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogoIcon, GoogleIcon } from './icons';

export const LoginScreen: React.FC = () => {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
            <div className="text-center max-w-md w-full">
                <LogoIcon className="w-24 h-24 mx-auto mb-4 text-indigo-400" />
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider mb-2">
                    Welcome to FaceMedia <span className="text-indigo-400">Studio</span>
                </h1>
                <p className="text-slate-400 mb-8">
                    Sign in to begin your creative journey and save your masterpieces.
                </p>
                <button
                    onClick={signInWithGoogle}
                    className="w-full flex justify-center items-center gap-4 py-3 px-4 bg-white text-slate-800 font-semibold rounded-md hover:bg-slate-200 transition-colors"
                >
                    <GoogleIcon className="w-6 h-6" />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};