import React from 'react';
import { Volume2, Sparkles, History, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenHelp,
  historyCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-1 ring-white/20">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                Suara<span className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">Kita</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                ID TTS Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Text-to-Speech Alami & Ekspresif Bahasa Indonesia ditenagai Gemini AI
            </p>
          </div>
        </div>

        {/* Right Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Gemini 3.8 Flash TTS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1"></span>
          </div>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors text-xs font-medium cursor-pointer"
            title="Lihat riwayat sintesis suara"
          >
            <History className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">Riwayat</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Panduan & Tips Pemakaian"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
