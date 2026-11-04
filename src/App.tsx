import React from 'react';
import { Header } from './components/Header';
import { TextInputArea } from './components/TextInputArea';
import { VoiceSelector } from './components/VoiceSelector';
import { MoodSelector } from './components/MoodSelector';
import { SpeedControl } from './components/SpeedControl';
import { AudioVisualizerPlayer } from './components/AudioVisualizerPlayer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ScriptAssistantModal } from './components/ScriptAssistantModal';
import { HelpModal } from './components/HelpModal';
import {
  VoiceGender,
  PrebuiltVoiceName,
  MoodId,
  GeneratedAudioItem,
  ScriptSample,
} from './types/tts';
import { base64ToUint8Array } from './utils/mp3Encoder';
import { speakWithBrowser } from './utils/browserSpeechFallback';
import { AlertCircle, Sparkles, Volume2, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'suarakita_tts_history_v1';

const DEFAULT_STARTER_TEXT =
  'Selamat datang di SuaraKita! Studio sintesis suara bahasa Indonesia modern bertenaga Gemini AI. Kami hadir dengan intonasi alami, ekspresi emosional yang hidup, serta kemudahan ekspor audio ke MP3.';

export default function App() {
  const [text, setText] = React.useState(DEFAULT_STARTER_TEXT);
  const [gender, setGender] = React.useState<VoiceGender>('wanita');
  const [voice, setVoice] = React.useState<PrebuiltVoiceName>('Kore');
  const [mood, setMood] = React.useState<MoodId>('ceria');
  const [customMood, setCustomMood] = React.useState('');
  const [speed, setSpeed] = React.useState<number>(1.0);
  const [model, setModel] = React.useState<'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts'>(
    'gemini-3.8-flash-lite-tts'
  );

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentAudio, setCurrentAudio] = React.useState<GeneratedAudioItem | null>(null);
  const [history, setHistory] = React.useState<GeneratedAudioItem[]>([]);
  const [generationError, setGenerationError] = React.useState<string | null>(null);

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [previewingVoice, setPreviewingVoice] = React.useState<PrebuiltVoiceName | null>(null);

  // Load history from localStorage on initial render
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Array<Omit<GeneratedAudioItem, 'audioBlob' | 'audioUrl'> & { audioBase64?: string }> = JSON.parse(stored);
        const reconstructed: GeneratedAudioItem[] = parsed
          .filter((item) => item && item.audioBase64)
          .slice(0, 15)
          .map((item) => {
            const bytes = base64ToUint8Array(item.audioBase64!);
            const blob = new Blob([bytes as unknown as BlobPart], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(blob);
            return {
              id: item.id,
              timestamp: item.timestamp,
              text: item.text,
              voice: item.voice,
              gender: item.gender,
              mood: item.mood,
              customMood: item.customMood,
              speed: item.speed,
              audioUrl,
              audioBlob: blob,
              durationSeconds: item.durationSeconds || 5,
              source: item.source || 'gemini',
            };
          });
        setHistory(reconstructed);
        if (reconstructed.length > 0) {
          setCurrentAudio(reconstructed[0]);
        }
      }
    } catch (e) {
      console.warn('Could not load history from storage:', e);
    }
  }, []);

  // Save history item helper
  const saveToHistory = (item: GeneratedAudioItem, base64: string) => {
    const newHistory = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 20);
    setHistory(newHistory);

    try {
      const serializable = newHistory.map((h) => ({
        id: h.id,
        timestamp: h.timestamp,
        text: h.text,
        voice: h.voice,
        gender: h.gender,
        mood: h.mood,
        customMood: h.customMood,
        speed: h.speed,
        durationSeconds: h.durationSeconds,
        source: h.source,
        audioBase64: h.id === item.id ? base64 : undefined,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Main TTS Generation handler
  const handleGenerateTTS = async () => {
    if (!text.trim()) {
      setGenerationError('Silakan masukkan teks naskah bahasa Indonesia terlebih dahulu.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          gender,
          mood,
          customMood,
          speed,
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.audioBase64) {
        throw new Error(
          data.error || 'Gagal menyintesis suara. Pastikan server terhubung dengan benar.'
        );
      }

      // Convert base64 WAV into Blob and Object URL
      const uint8 = base64ToUint8Array(data.audioBase64);
      const audioBlob = new Blob([uint8 as unknown as BlobPart], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const newItem: GeneratedAudioItem = {
        id: 'tts_' + Date.now(),
        timestamp: Date.now(),
        text: text.trim(),
        voice,
        gender,
        mood,
        customMood,
        speed,
        audioUrl,
        audioBlob,
        durationSeconds: 0,
        source: 'gemini',
      };

      setCurrentAudio(newItem);
      saveToHistory(newItem, data.audioBase64);
    } catch (err: any) {
      console.error('Error generating audio:', err);
      setGenerationError(
        err?.message || 'Terjadi gangguan saat memproses audio dengan Gemini AI.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview Voice Sample button
  const handlePreviewVoiceSample = (samplePhrase: string, sampleVoice: PrebuiltVoiceName) => {
    setPreviewingVoice(sampleVoice);

    // Try fast fallback browser speech or alert for instant response
    try {
      speakWithBrowser(samplePhrase, {
        rate: speed,
        onEnd: () => setPreviewingVoice(null),
        onError: () => setPreviewingVoice(null),
      });
      // Safety timeout
      setTimeout(() => setPreviewingVoice(null), 4000);
    } catch {
      setPreviewingVoice(null);
    }
  };

  const handleApplySample = (sample: ScriptSample) => {
    setText(sample.text);
    setVoice(sample.suggestedVoice);
    const matchedVoice = sample.suggestedVoice;
    if (['Kore', 'Zephyr'].includes(matchedVoice)) {
      setGender('wanita');
    } else {
      setGender('pria');
    }
    setMood(sample.suggestedMood);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    if (currentAudio?.id === id) {
      setCurrentAudio(updated[0] || null);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setCurrentAudio(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        historyCount={history.length}
      />

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Notification Banner if any */}
        {generationError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold mb-0.5">
                Pemberitahuan Sistem:
              </strong>
              <span>{generationError}</span>
              <div className="mt-2 text-xs text-rose-400 flex items-center gap-2">
                <span>Tips: Anda juga dapat menggunakan tombol "Dengar Contoh Suara" untuk pratinjau instan.</span>
              </div>
            </div>
            <button
              onClick={() => setGenerationError(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Section 1: Audio Visualizer & Player (Primary Hero Output) */}
        <AudioVisualizerPlayer
          currentAudio={currentAudio}
          isGenerating={isGenerating}
          onGenerate={handleGenerateTTS}
          canGenerate={!!text.trim()}
        />

        {/* Section 2: Text Input Area */}
        <TextInputArea
          text={text}
          onChange={setText}
          speed={speed}
          onApplySample={handleApplySample}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          isGenerating={isGenerating}
        />

        {/* Section 3: Voice Selection (Gender & Persona) */}
        <VoiceSelector
          gender={gender}
          onGenderChange={setGender}
          voice={voice}
          onVoiceChange={setVoice}
          onPreviewVoiceSample={handlePreviewVoiceSample}
          previewingVoice={previewingVoice}
        />

        {/* Section 4: Mood & Emotional Acting Selector */}
        <MoodSelector
          mood={mood}
          onMoodChange={setMood}
          customMood={customMood}
          onCustomMoodChange={setCustomMood}
        />

        {/* Section 5: Speed & Model Settings */}
        <SpeedControl
          speed={speed}
          onSpeedChange={setSpeed}
          model={model}
          onModelChange={setModel}
        />

        {/* Footer Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-850">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              ID
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">Bahasa Indonesia Alami</span>
              <span>Pelafalan baku, santai, dan intonasi nusantara yang ekspresif</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-850">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              MP3
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">Ekspor MP3 Berkualitas</span>
              <span>Dikonversi langsung 160kbps untuk YouTube, podcast & WA</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-850">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              AI
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">Gemini 3.8 Flash TTS</span>
              <span>Sutradara vokal pintar dengan kendali mood & tempo presisi</span>
            </div>
          </div>
        </div>
      </main>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectAudio={(item) => {
          setCurrentAudio(item);
          setIsHistoryOpen(false);
        }}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        currentAudioId={currentAudio?.id}
      />

      {/* Script Assistant Modal */}
      <ScriptAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        currentText={text}
        onApplyScript={(newScript) => setText(newScript)}
      />

      {/* Help & Guide Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
