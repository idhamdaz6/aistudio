import React from 'react';
import { Smile, Sparkles, MessageSquare } from 'lucide-react';
import { MoodId, MoodOption } from '../types/tts';
import { MOOD_OPTIONS } from '../utils/sampleScripts';

interface MoodSelectorProps {
  mood: MoodId;
  onMoodChange: (mood: MoodId) => void;
  customMood: string;
  onCustomMoodChange: (custom: string) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  mood,
  onMoodChange,
  customMood,
  onCustomMoodChange,
}) => {
  const [activeTab, setActiveTab] = React.useState<'Semua' | 'Populer' | 'Profesional' | 'Ekspresif'>('Semua');

  const filteredMoods = React.useMemo(() => {
    if (activeTab === 'Semua') return MOOD_OPTIONS;
    return MOOD_OPTIONS.filter((m) => m.category === activeTab);
  }, [activeTab]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Smile className="w-4 h-4 text-amber-400" />
            Mood & Gaya Suara (Expressive Acting)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Gemini AI akan menyesuaikan emosi vokal, warna nada, dan intonasi sesuai mood terpilih
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          {(['Semua', 'Populer', 'Profesional', 'Ekspresif'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of moods */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {filteredMoods.map((m: MoodOption) => {
          const isSelected = mood === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onMoodChange(m.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500/15 to-rose-500/15 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-750 hover:bg-slate-850/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {m.emoji}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-100 group-hover:text-amber-300 transition">
                  {m.label}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                  {m.shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom mood prompt input if 'custom' is active */}
      {mood === 'custom' && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/40 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Instruksi Gaya Suara Khusus (Custom Mood Direction)</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            Jelaskan gaya bicara yang diinginkan (contoh: "Gaya dosen muda yang santai namun tegas dan penuh wawasan"):
          </p>
          <div className="relative">
            <input
              type="text"
              value={customMood}
              onChange={(e) => onCustomMoodChange(e.target.value)}
              placeholder="Misal: Suara berbisik misterius dengan tempo lambat diiringi desah napas..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
