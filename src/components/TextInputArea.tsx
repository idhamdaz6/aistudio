import React from 'react';
import {
  Sparkles,
  FileText,
  Trash2,
  Copy,
  Check,
  Clock,
  Type,
  PlusCircle,
} from 'lucide-react';
import { SAMPLE_SCRIPTS } from '../utils/sampleScripts';
import { ScriptSample } from '../types/tts';

interface TextInputAreaProps {
  text: string;
  onChange: (newText: string) => void;
  speed: number;
  onApplySample: (sample: ScriptSample) => void;
  onOpenAssistant: () => void;
  isGenerating: boolean;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  text,
  onChange,
  speed,
  onApplySample,
  onOpenAssistant,
  isGenerating,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showSamplesMenu, setShowSamplesMenu] = React.useState(false);

  const wordCount = React.useMemo(() => {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [text]);

  const charCount = text.length;

  // Approximate duration: average 140 words per minute in Indonesian at 1.0x speed
  const estimatedSeconds = React.useMemo(() => {
    if (wordCount === 0) return 0;
    const baseWpm = 135;
    const adjustedWpm = baseWpm * speed;
    return Math.max(1, Math.round((wordCount / adjustedWpm) * 60));
  }, [wordCount, speed]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertTag = (tag: string) => {
    onChange(text + (text.endsWith(' ') || text === '' ? '' : ' ') + tag + ' ');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Naskah Teks Bahasa Indonesia
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Sample Templates Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSamplesMenu(!showSamplesMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700/80 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Contoh Naskah</span>
            </button>

            {showSamplesMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowSamplesMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-850 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pilih Template Siap Pakai
                  </div>
                  {SAMPLE_SCRIPTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onApplySample(sample);
                        setShowSamplesMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 transition flex flex-col gap-0.5 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-rose-400 transition">
                          {sample.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-750 text-slate-400 border border-slate-700">
                          {sample.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {sample.text}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* AI Script Assistant */}
          <button
            type="button"
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition cursor-pointer"
            title="Optimalkan naskah untuk suara alami dengan Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Asisten Naskah AI</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            title="Salin Naskah"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={!text || isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            title="Hapus Naskah"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ketik atau tempel teks bahasa Indonesia di sini... Contoh: Selamat pagi! Semoga hari Anda penuh dengan keberkahan dan kebahagiaan luar biasa."
          rows={6}
          disabled={isGenerating}
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/80 transition resize-y font-normal leading-relaxed"
        />
      </div>

      {/* Quick insertion chips & Metrics */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        {/* Quick Expression Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <PlusCircle className="w-3 h-3" /> Sisipkan ekspresi:
          </span>
          <button
            type="button"
            onClick={() => insertTag('...')}
            className="px-2 py-0.5 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-[11px] font-mono transition cursor-pointer"
            title="Jeda sejenak (...)"
          >
            ... (jeda)
          </button>
          <button
            type="button"
            onClick={() => insertTag('<breath>')}
            className="px-2 py-0.5 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-[11px] font-mono transition cursor-pointer"
            title="Helaan napas alami"
          >
            &lt;breath&gt;
          </button>
          <button
            type="button"
            onClick={() => insertTag('<laugh>')}
            className="px-2 py-0.5 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-[11px] font-mono transition cursor-pointer"
            title="Tawa kecil ramah"
          >
            &lt;laugh&gt;
          </button>
          <button
            type="button"
            onClick={() => insertTag('|mhm|')}
            className="px-2 py-0.5 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-[11px] font-mono transition cursor-pointer"
            title="Afirmasi vokal natural"
          >
            |mhm|
          </button>
        </div>

        {/* Counters & Duration */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>
              <strong className="text-slate-200">{charCount}</strong> karakter /{' '}
              <strong className="text-slate-200">{wordCount}</strong> kata
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400/80" />
            <span>
              Perkiraan durasi:{' '}
              <strong className="text-amber-300">~{estimatedSeconds}d</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
