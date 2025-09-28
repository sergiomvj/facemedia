
import React from 'react';
import { STYLE_PRESETS } from '../constants';

interface StylePresetSelectorProps {
    selectedPreset: string | null;
    onSelectPreset: (presetName: string | null) => void;
}

export const StylePresetSelector: React.FC<StylePresetSelectorProps> = ({ selectedPreset, onSelectPreset }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Style Presets</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {STYLE_PRESETS.map((preset) => (
                    <button
                        key={preset.name}
                        onClick={() => onSelectPreset(selectedPreset === preset.name ? null : preset.name)}
                        className={`px-2 py-3 text-xs font-semibold rounded-md transition-all duration-200 border-2 
                            ${selectedPreset === preset.name 
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105' 
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-indigo-500 hover:bg-slate-600'}`}
                        title={preset.prompt}
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
