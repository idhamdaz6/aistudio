import React from 'react';
import { X, BookOpen, Volume2, Sparkles, Download, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Panduan Studio SuaraKita AI
              </h3>
              <p className="text-xs text-slate-400">
                Cara memanfaatkan seluruh fitur TTS Bahasa Indonesia & Ekspor MP3
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

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-rose-400 flex items-center gap-1.5 mb-1.5 text-sm">
              <Volume2 className="w-4 h-4" />
              1. Pilihan Gender & Karakter Suara
            </h4>
            <p className="mb-2">
              Tersedia pilihan gender <strong>Wanita</strong> (Kore, Zephyr) dan <strong>Pria</strong> (Puck, Fenrir, Charon). Setiap suara memiliki resonansi vokal yang unik, mulai dari gaya santai kasual, formal berwibawa, hingga lembut menenangkan.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-semibold text-white block">Kore & Zephyr (Wanita)</span>
                Sangat natural untuk berita, tutorial, customer service, & dongeng.
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-semibold text-white block">Puck, Fenrir, Charon (Pria)</span>
                Ideal untuk narasi dokumenter, sambutan resmi, & vlog santai.
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5 text-sm">
              <Sparkles className="w-4 h-4" />
              2. Mood Suara & Akting Vokal Ekspresif
            </h4>
            <p>
              Dengan kekuatan Gemini AI, Anda dapat menginstruksikan mood suara seperti <strong>Ceria</strong>, <strong>Formal/Berita</strong>, <strong>Santai</strong>, <strong>Bersemangat</strong>, <strong>Tenang</strong>, <strong>Dongeng</strong>, <strong>Misterius</strong>, <strong>Iklan</strong>, atau menulis <em>prompt kustom</em> Anda sendiri!
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5 text-sm">
              <Download className="w-4 h-4" />
              3. Penyesuaian Kecepatan & Ekspor MP3
            </h4>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>
                Kecepatan bicara dapat diatur dari <strong>0.50x hingga 2.00x</strong>.
              </li>
              <li>
                Hasil audio dapat diunduh langsung sebagai file <strong>MP3</strong> (dikompresi standar 160kbps untuk WhatsApp/YouTube/Podcast) atau file master <strong>WAV 24kHz HD</strong>.
              </li>
              <li>
                Perubahan kecepatan playback di player juga akan otomatis diterapkan saat mengekspor MP3!
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-sky-400 flex items-center gap-1.5 mb-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              4. Tips Penulisan Naskah Terbaik
            </h4>
            <p className="text-slate-400">
              Gunakan tanda baca titik dan koma dengan tepat untuk memberi jeda alami bagi napas AI. Sisipkan kode ekspresi seperti <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">&lt;breath&gt;</code> untuk helaan napas atau <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">&lt;laugh&gt;</code> untuk tawa kecil. Gunakan fitur <strong>Asisten Naskah AI</strong> untuk memoles tulisan Anda secara otomatis!
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs transition cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
