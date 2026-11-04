import React from 'react';
import {
  X,
  History,
  Trash2,
  Play,
  Download,
  Copy,
  Clock,
  ArrowRight,
  FileAudio,
} from 'lucide-react';
import { GeneratedAudioItem } from '../types/tts';
import { downloadBlob } from '../utils/mp3Encoder';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedAudioItem[];
  onSelectAudio: (item: GeneratedAudioItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  currentAudioId?: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectAudio,
  onDeleteHistoryItem,
  onClearHistory,
  currentAudioId,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Riwayat Suara Sintesis
              </h3>
              <p className="text-xs text-slate-400">
                {history.length} rekaman audio tersimpan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Hapus Semua Riwayat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileAudio className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">
                Belum ada riwayat suara
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Setiap suara yang Anda sintesis akan otomatis tersimpan di sini untuk diputar ulang atau diekspor ke MP3.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const isActive = currentAudioId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-rose-500/10 border-rose-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{item.voice}</span>
                      <span className="text-[10px] text-slate-400">
                        ({item.gender === 'wanita' ? 'Wanita' : 'Pria'})
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 text-[10px] capitalize">
                        {item.mood}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {item.speed}x
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    "{item.text}"
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                    <button
                      type="button"
                      onClick={() => onSelectAudio(item)}
                      className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-rose-400" />
                      <span>{isActive ? 'Sedang Diputar' : 'Putar di Studio'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const safeText = item.text
                            .slice(0, 15)
                            .replace(/[^a-zA-Z0-9]/g, '_');
                          downloadBlob(item.audioBlob, `suarakita_${item.voice}_${safeText}.wav`);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                        title="Unduh File Suara"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                        title="Hapus Rekaman Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
