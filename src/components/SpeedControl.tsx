import React from 'react';
import { Gauge, Sliders, Cpu, Zap } from 'lucide-react';

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  model: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';
  onModelChange: (model: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts') => void;
}

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const SpeedControl: React.FC<SpeedControlProps> = ({
  speed,
  onSpeedChange,
  model,
  onModelChange,
}) => {
  const getSpeedLabel = (s: number) => {
    if (s <= 0.6) return 'Sangat Lambat';
    if (s <= 0.85) return 'Santai / Perlahan';
    if (s >= 0.95 && s <= 1.05) return 'Normal (Standar)';
    if (s <= 1.35) return 'Lincah / Cepat';
    if (s <= 1.7) return 'Sangat Cepat';
    return 'Tempo Maksimal';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Kecepatan Bicara & Mesin AI
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur tempo pengucapan kata dan pilih arsitektur model Gemini TTS
          </p>
        </div>

        {/* Speed Label Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <span>{speed.toFixed(2)}x</span>
          <span className="text-emerald-400/60">•</span>
          <span className="text-emerald-400/90">{getSpeedLabel(speed)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Speed Slider & Presets (Spans 2 columns) */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>0.5x (Lambat)</span>
            <span className="text-slate-300 font-bold">Kecepatan Bicara ({speed.toFixed(2)}x)</span>
            <span>2.0x (Cepat)</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">Preset:</span>
            {SPEED_PRESETS.map((preset) => {
              const isSelected = Math.abs(speed - preset) < 0.02;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onSpeedChange(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80'
                  }`}
                >
                  {preset.toFixed(preset % 1 === 0 ? 1 : 2)}x
                </button>
              );
            })}
          </div>
        </div>

        {/* Gemini Model Choice */}
        <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-5 space-y-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-rose-400" />
            Model Suara Gemini:
          </span>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onModelChange('gemini-3.8-flash-lite-tts')}
              className={`w-full text-left p-2 rounded-xl border text-xs transition cursor-pointer ${
                model === 'gemini-3.8-flash-lite-tts'
                  ? 'bg-rose-500/15 border-rose-500/60 text-white ring-1 ring-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Flash Lite TTS
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded">
                  Rekomendasi
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Cepat, latensi rendah, intonasi fasih
              </p>
            </button>

            <button
              type="button"
              onClick={() => onModelChange('gemini-3.8-flash-tts')}
              className={`w-full text-left p-2 rounded-xl border text-xs transition cursor-pointer ${
                model === 'gemini-3.8-flash-tts'
                  ? 'bg-rose-500/15 border-rose-500/60 text-white ring-1 ring-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span>Flash TTS Flagship</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                  Studio
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Dramatisasi vokal mendalam & ekspresi kaya
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
