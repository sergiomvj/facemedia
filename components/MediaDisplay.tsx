
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MediaResult } from '../types';
import { DownloadIcon, WandIcon, LogoIcon, PlayIcon, PauseIcon, VolumeMuteIcon, VolumeHighIcon, FullscreenIcon, RemoveBgIcon } from './icons';

const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const VideoPlayer: React.FC<{ src: string, onDownload: () => void }> = ({ src, onDownload }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isControlsVisible, setControlsVisible] = useState(true);
    const controlsTimeoutRef = useRef<number | null>(null);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        if (videoRef.current) setDuration(videoRef.current.duration);
    }, []);

    const showControls = useCallback(() => {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setControlsVisible(true);
        controlsTimeoutRef.current = window.setTimeout(() => {
            if (videoRef.current && !videoRef.current.paused) {
                setControlsVisible(false);
            }
        }, 3000);
    }, []);
    
    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            const onPlay = () => setIsPlaying(true);
            const onPause = () => setIsPlaying(false);

            videoElement.addEventListener('timeupdate', handleTimeUpdate);
            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
            videoElement.addEventListener('play', onPlay);
            videoElement.addEventListener('pause', onPause);
            videoElement.addEventListener('ended', onPause);
            
            setIsPlaying(!videoElement.paused);
            setIsMuted(videoElement.muted);
            setVolume(videoElement.volume);

            return () => {
                videoElement.removeEventListener('timeupdate', handleTimeUpdate);
                videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
                videoElement.removeEventListener('play', onPlay);
                videoElement.removeEventListener('pause', onPause);
                videoElement.removeEventListener('ended', onPause);
            };
        }
    }, [src, handleTimeUpdate, handleLoadedMetadata]);

    useEffect(() => {
        const container = containerRef.current;
        const handleMouseMove = () => showControls();
        const handleMouseLeave = () => { if (isPlaying) setControlsVisible(false); };
        
        container?.addEventListener('mousemove', handleMouseMove);
        container?.addEventListener('mouseleave', handleMouseLeave);
        showControls();

        return () => {
            container?.removeEventListener('mousemove', handleMouseMove);
            container?.removeEventListener('mouseleave', handleMouseLeave);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [showControls, isPlaying]);

    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
    }, []);
    
    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current && duration > 0) {
            const progressBar = e.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const seekPosition = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = seekPosition * duration;
        }
    }, [duration]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            videoRef.current.muted = newVolume === 0;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            const newMutedState = !videoRef.current.muted;
            videoRef.current.muted = newMutedState;
            setIsMuted(newMutedState);
            if (!newMutedState && videoRef.current.volume === 0) {
                 videoRef.current.volume = 1;
                 setVolume(1);
            }
        }
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (containerRef.current) {
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    }, []);

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black group/video">
            <video
                ref={videoRef}
                src={src}
                autoPlay
                loop
                muted
                onClick={togglePlayPause}
                className="w-full h-full object-contain cursor-pointer"
            />
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group/progress" onClick={handleSeek}>
                    <div className="absolute h-full bg-indigo-500 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: `${progressPercentage}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
                           {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                        </button>
                        <div className="flex items-center gap-2 group/volume">
                           <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                                {isMuted || volume === 0 ? <VolumeMuteIcon className="w-6 h-6" /> : <VolumeHighIcon className="w-6 h-6" />}
                            </button>
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 h-1 rounded-lg appearance-none cursor-pointer bg-white/30 transition-all duration-300 group-hover/volume:w-24"
                                aria-label="Volume control"
                            />
                        </div>
                        <span className="text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onDownload} aria-label="Download video" title="Download video">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                        <button onClick={toggleFullscreen} aria-label="Toggle fullscreen" title="Toggle fullscreen">
                            <FullscreenIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MediaContent: React.FC<{ result: MediaResult; onUseAsBase: () => void; onRemoveBackground: () => void; }> = ({ result, onUseAsBase, onRemoveBackground }) => {
    const downloadMedia = () => {
        if (!result.src) return;
        const link = document.createElement('a');
        link.href = result.src;
        link.download = `facemedia-studio-${Date.now()}.${result.type === 'image' ? 'png' : 'mp4'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (result.type === 'video' && result.src) {
        return <VideoPlayer src={result.src} onDownload={downloadMedia} />;
    }
    
    if (result.type === 'image' && result.src) {
        return (
            <div className="w-full h-full relative group">
                <img src={result.src} alt="Generated media" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={downloadMedia} className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-md hover:bg-slate-700/80 transition">
                        <DownloadIcon /> Download
                    </button>
                     <button onClick={onRemoveBackground} className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-md hover:bg-slate-700/80 transition">
                        <RemoveBgIcon /> Remove BG
                    </button>
                    <button onClick={onUseAsBase} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 rounded-md hover:bg-indigo-500/80 transition">
                        <WandIcon /> Use as Base
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

interface MediaDisplayProps {
    mediaResult: MediaResult | null;
    isLoading: boolean;
    loadingMessage: string;
    onUseAsBase: () => void;
    onRemoveBackground: () => void;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ mediaResult, isLoading, loadingMessage, onUseAsBase, onRemoveBackground }) => {
    return (
        <div className="bg-slate-800 rounded-lg p-4 flex flex-col justify-center items-center h-full min-h-[400px] md:min-h-0">
            {isLoading ? (
                <div className="text-center">
                    <div className="animate-pulse text-indigo-400 mb-4">
                        <WandIcon className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-lg font-semibold">{loadingMessage || 'Generating...'}</p>
                    <p className="text-slate-400 text-sm">Please wait, magic is in progress.</p>
                </div>
            ) : mediaResult ? (
                <div className="w-full h-full flex flex-col gap-4">
                   {mediaResult.type === 'text' && mediaResult.text ? (
                       <div className="flex-grow flex items-center justify-center text-center text-red-400 p-4 bg-red-900/20 rounded-md">
                           <p>{mediaResult.text}</p>
                       </div>
                   ) : (
                       <>
                           <div className="flex-grow flex items-center justify-center relative w-full h-full">
                               <MediaContent result={mediaResult} onUseAsBase={onUseAsBase} onRemoveBackground={onRemoveBackground} />
                           </div>
                           {mediaResult.text && (
                               <div className="flex-shrink-0 bg-slate-700 p-3 rounded-md max-h-24 overflow-y-auto">
                                   <p className="text-sm text-slate-300">{mediaResult.text}</p>
                               </div>
                           )}
                       </>
                   )}
                </div>
            ) : (
                <div className="text-center text-slate-500">
                    <LogoIcon className="w-24 h-24 mx-auto mb-4 opacity-30" />
                    <h2 className="text-2xl font-bold text-slate-400">Welcome to FaceMedia Studio</h2>
                    <p>Your creative canvas awaits. Adjust the settings on the left and bring your vision to life.</p>
                </div>
            )}
        </div>
    );
};
