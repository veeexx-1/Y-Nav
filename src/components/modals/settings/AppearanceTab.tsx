import React from 'react';
import { SiteSettings } from '../../../types';

interface AppearanceTabProps {
    settings: SiteSettings;
    onChange: (key: keyof SiteSettings, value: any) => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({ settings, onChange }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Theme Color */}
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">主题色调 (Theme Color)</label>
                <div className="grid grid-cols-6 gap-3">
                    {[
                        { name: 'Indigo', value: '99 102 241', class: 'bg-indigo-500' },
                        { name: 'Blue', value: '59 130 246', class: 'bg-blue-500' },
                        { name: 'Purple', value: '168 85 247', class: 'bg-purple-500' },
                        { name: 'Rose', value: '244 63 94', class: 'bg-rose-500' },
                        { name: 'Orange', value: '249 115 22', class: 'bg-orange-500' },
                        { name: 'Emerald', value: '16 185 129', class: 'bg-emerald-500' },
                    ].map((color) => (
                        <button
                            key={color.value}
                            onClick={() => onChange('accentColor', color.value)}
                            className={`h-10 rounded-full ${color.class} transition-all duration-300 relative group border border-slate-100 dark:border-slate-700`}
                            title={color.name}
                        >
                            {settings.accentColor === color.value && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Background Tone */}
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">背景风格 (Background)</label>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => onChange('grayScale', 'zinc')}
                        className={`p-3 rounded-xl border transition-all ${settings.grayScale === 'zinc'
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-500 ring-2 ring-zinc-500/20'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                        <div className="w-full h-12 rounded-lg bg-zinc-500 mb-2 shadow-sm"></div>
                        <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">高级灰 (Zinc)</div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">纯净无色偏</div>
                    </button>

                    <button
                        onClick={() => onChange('grayScale', 'slate')}
                        className={`p-3 rounded-xl border transition-all ${settings.grayScale === 'slate'
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-500 ring-2 ring-slate-500/20'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <div className="w-full h-12 rounded-lg bg-slate-500 mb-2 shadow-sm"></div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">青灰 (Slate)</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">经典冷色调</div>
                    </button>

                    <button
                        onClick={() => onChange('grayScale', 'neutral')}
                        className={`p-3 rounded-xl border transition-all ${settings.grayScale === 'neutral'
                            ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-500 ring-2 ring-neutral-500/20'
                            : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    >
                        <div className="w-full h-12 rounded-lg bg-neutral-500 mb-2 shadow-sm"></div>
                        <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">暖灰 (Neutral)</div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-0.5">柔和舒适</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppearanceTab;
