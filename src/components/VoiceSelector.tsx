import React from 'react';
import { User, Users, Volume2 } from 'lucide-react';
import { VoiceGender, PrebuiltVoiceName, VoiceOption } from '../types/tts';
import { VOICE_OPTIONS } from '../utils/sampleScripts';

interface VoiceSelectorProps {
  gender: VoiceGender;
  onGenderChange: (gender: VoiceGender) => void;
  voice: PrebuiltVoiceName;
  onVoiceChange: (voice: PrebuiltVoiceName) => void;
  onPreviewVoiceSample: (sampleText: string, voice: PrebuiltVoiceName) => void;
  previewingVoice: PrebuiltVoiceName | null;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  gender,
  onGenderChange,
  voice,
  onVoiceChange,
  onPreviewVoiceSample,
  previewingVoice,
}) => {
  // Filter voice options based on gender
  const currentVoiceOptions = React.useMemo(() => {
    return VOICE_OPTIONS.filter((v) => v.gender === gender);
  }, [gender]);

  const handleGenderToggle = (newGender: VoiceGender) => {
    onGenderChange(newGender);
    // Auto-select first voice of that gender
    const defaultVoiceForGender = VOICE_OPTIONS.find((v) => v.gender === newGender);
    if (defaultVoiceForGender) {
      onVoiceChange(defaultVoiceForGender.id);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            Pilihan Gender & Karakter Suara
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih gender dan karakter vokal bahasa Indonesia yang diinginkan
          </p>
        </div>

        {/* Gender Toggle Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => handleGenderToggle('wanita')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              gender === 'wanita'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👩</span>
            <span>Wanita</span>
          </button>
          <button
            type="button"
            onClick={() => handleGenderToggle('pria')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              gender === 'pria'
                ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👨</span>
            <span>Pria</span>
          </button>
        </div>
      </div>

      {/* Voice cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentVoiceOptions.map((v: VoiceOption) => {
          const isSelected = voice === v.id;
          const isPreviewing = previewingVoice === v.id;

          return (
            <div
              key={v.id}
              onClick={() => onVoiceChange(v.id)}
              className={`relative rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-800/90 to-slate-850/90 border-rose-500/80 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                      {v.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{v.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {v.gender === 'wanita' ? 'Vokal Wanita' : 'Vokal Pria'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {v.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-snug mb-2 font-normal">
                  {v.description}
                </p>
                <div className="text-[11px] text-slate-400 mb-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Cocok untuk:
                  </span>
                  <span className="text-slate-300">{v.recommendedFor}</span>
                </div>
              </div>

              {/* Preview Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewVoiceSample(v.samplePhrase, v.id);
                }}
                className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                  isPreviewing
                    ? 'bg-rose-500/30 text-rose-200 border-rose-500/50'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700/70 hover:text-white'
                }`}
              >
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    isPreviewing ? 'text-rose-400 animate-bounce' : 'text-slate-400'
                  }`}
                />
                <span>{isPreviewing ? 'Memutar Sampel...' : 'Dengar Contoh Suara'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
