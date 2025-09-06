
import React from 'react';
import { ASPECT_RATIOS } from '../constants';
import type { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
    selectedRatio: AspectRatio;
    onSelectRatio: (ratio: AspectRatio) => void;
}

const ratioDimensions: Record<AspectRatio, { w: number, h: number }> = {
    '1:1': { w: 32, h: 32 },
    '16:9': { w: 48, h: 27 },
    '9:16': { w: 27, h: 48 },
    '4:3': { w: 40, h: 30 },
    '3:4': { w: 30, h: 40 },
};

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onSelectRatio }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
            <div className="flex justify-between items-end gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                    <div key={ratio} className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => onSelectRatio(ratio)}
                            className={`flex items-center justify-center border-2 rounded transition-colors ${selectedRatio === ratio ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500'}`}
                            style={{ 
                                width: ratioDimensions[ratio].w + 4, 
                                height: ratioDimensions[ratio].h + 4,
                            }}
                        >
                            <div className={`transition-colors ${selectedRatio === ratio ? 'bg-indigo-500/50' : 'bg-slate-700'}`} style={{ width: ratioDimensions[ratio].w, height: ratioDimensions[ratio].h }} />
                        </button>
                        <span className={`text-xs ${selectedRatio === ratio ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}>{ratio}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
