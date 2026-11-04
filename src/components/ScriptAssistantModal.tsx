import React from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Check,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  MessageSquare,
  Loader2,
} from 'lucide-react';

interface ScriptAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  onApplyScript: (script: string) => void;
}

export const ScriptAssistantModal: React.FC<ScriptAssistantModalProps> = ({
  isOpen,
  onClose,
  currentText,
  onApplyScript,
}) => {
  const [activeAction, setActiveAction] = React.useState<
    'optimize_narration' | 'add_expressive_cues' | 'generate_sample'
  >('optimize_narration');
  const [sampleTheme, setSampleTheme] = React.useState('Iklan Kuliner Nusantara');
  const [resultText, setResultText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setResultText('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts/enhance-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activeAction,
          text: currentText,
          tone: sampleTheme,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses asisten naskah.');
      }

      setResultText(data.enhancedText);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat menghubungi Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (resultText) {
      onApplyScript(resultText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Asisten Naskah Gemini AI
              </h3>
              <p className="text-xs text-slate-400">
                Optimalkan intonasi, ritme kata, dan jeda vokal untuk TTS bahasa Indonesia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveAction('optimize_narration')}
            className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer ${
              activeAction === 'optimize_narration'
                ? 'bg-rose-500/15 border-rose-500/70 text-rose-300 font-bold ring-1 ring-rose-500/30'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="block font-semibold">1. Polesan Alami</span>
            <span className="text-[10px] text-slate-500">Perbaiki jeda & ejaan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('add_expressive_cues')}
            className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer ${
              activeAction === 'add_expressive_cues'
                ? 'bg-rose-500/15 border-rose-500/70 text-rose-300 font-bold ring-1 ring-rose-500/30'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="block font-semibold">2. Tambah Ekspresi</span>
            <span className="text-[10px] text-slate-500">Napas, tawa, afirmasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('generate_sample')}
            className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer ${
              activeAction === 'generate_sample'
                ? 'bg-rose-500/15 border-rose-500/70 text-rose-300 font-bold ring-1 ring-rose-500/30'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="block font-semibold">3. Buat Naskah Baru</span>
            <span className="text-[10px] text-slate-500">Dari topik / ide</span>
          </button>
        </div>

        {/* Generate Sample Theme Options */}
        {activeAction === 'generate_sample' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Pilih atau Tulis Topik Naskah:
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {[
                'Iklan Kuliner Nusantara',
                'Motivasi Pagi Semangat',
                'Berita Teknologi AI',
                'Sambutan Acara Pernikahan',
                'Dongeng Anak Petualangan',
              ].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSampleTheme(theme)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    sampleTheme === theme
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={sampleTheme}
              onChange={(e) => setSampleTheme(e.target.value)}
              placeholder="Contoh: Iklan promo kopi susu gula aren..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}

        {/* Context Preview */}
        {activeAction !== 'generate_sample' && (
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">
              Teks Naskah Saat Ini:
            </span>
            <p className="text-xs text-slate-300 max-h-20 overflow-y-auto italic">
              {currentText || '(Naskah masih kosong, silakan ketik di teks studio terlebih dahulu)'}
            </p>
          </div>
        )}

        {/* Generate Trigger Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || (activeAction !== 'generate_sample' && !currentText.trim())}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 shadow-md shadow-rose-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses dengan Gemini AI...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Proses Naskah Sekarang</span>
            </>
          )}
        </button>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Result Area */}
        {resultText && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Hasil Polesan Gemini AI:
            </span>
            <textarea
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Terapkan ke Studio Naskah</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
