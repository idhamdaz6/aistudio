import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  FileAudio,
  Sparkles,
  Share2,
  Check,
  FastForward,
  Rewind,
  Loader2,
} from 'lucide-react';
import { GeneratedAudioItem } from '../types/tts';
import {
  convertBase64WavToMp3Blob,
  downloadBlob,
} from '../utils/mp3Encoder';

interface AudioVisualizerPlayerProps {
  currentAudio: GeneratedAudioItem | null;
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

export const AudioVisualizerPlayer: React.FC<AudioVisualizerPlayerProps> = ({
  currentAudio,
  isGenerating,
  onGenerate,
  canGenerate,
}) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1.0);
  const [volume, setVolume] = React.useState(1.0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isExportingMp3, setIsExportingMp3] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Sync audio source when currentAudio changes
  React.useEffect(() => {
    if (audioRef.current && currentAudio) {
      audioRef.current.src = currentAudio.audioUrl;
      audioRef.current.playbackRate = currentAudio.speed || 1.0;
      setPlaybackRate(currentAudio.speed || 1.0);
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentAudio]);

  // Audio event listeners
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentAudio) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio play error:', e);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + seconds)
      );
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  // Waveform canvas animation
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = 64;
    const renderWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / bars;
      const progress = duration > 0 ? currentTime / duration : 0;

      for (let i = 0; i < bars; i++) {
        const barProgress = i / bars;
        let barHeight = 8;

        if (isPlaying) {
          // Dynamic simulated frequencies based on playback
          const wave1 = Math.sin(Date.now() * 0.006 + i * 0.2);
          const wave2 = Math.cos(Date.now() * 0.009 + i * 0.3);
          const amp = Math.abs(wave1 * wave2);
          barHeight = Math.max(6, amp * (height * 0.85));
        } else {
          // Static calm visualizer pattern
          const curve = Math.sin((i / bars) * Math.PI);
          barHeight = Math.max(6, curve * 28 + (i % 3 === 0 ? 8 : 4));
        }

        const isPassed = barProgress <= progress;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        ctx.fillStyle = isPassed
          ? isPlaying
            ? '#f43f5e' // rose-500
            : '#fb7185' // rose-400
          : '#334155'; // slate-700

        ctx.beginPath();
        ctx.roundRect(x + 1, y, Math.max(2, barWidth - 2), barHeight, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  // Export to MP3 handler
  const handleExportMp3 = async () => {
    if (!currentAudio) return;
    setIsExportingMp3(true);

    try {
      // Fetch arrayBuffer from audioUrl or blob
      const res = await fetch(currentAudio.audioUrl);
      const arrayBuf = await res.arrayBuffer();

      // Convert to base64 for decoding & encoding
      let binary = '';
      const bytes = new Uint8Array(arrayBuf);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      // Encode to MP3 with current playback rate applied!
      const { blob } = await convertBase64WavToMp3Blob(
        base64,
        playbackRate,
        160
      );

      const safeText = currentAudio.text
        .slice(0, 15)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      const filename = `suarakita_${currentAudio.gender}_${currentAudio.mood}_${playbackRate}x_${safeText}.mp3`;

      downloadBlob(blob, filename);
    } catch (err: any) {
      console.error('Gagal mengekspor MP3:', err);
      alert('Gagal mengekspor MP3: ' + (err?.message || 'Kesalahan encoding'));
    } finally {
      setIsExportingMp3(false);
    }
  };

  // Export to Master WAV handler
  const handleExportWav = () => {
    if (!currentAudio) return;
    const safeText = currentAudio.text
      .slice(0, 15)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    const filename = `suarakita_master_24khz_${currentAudio.gender}_${safeText}.wav`;
    downloadBlob(currentAudio.audioBlob, filename);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Hidden standard audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <FileAudio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Studio Pemutar & Ekspor Audio
            </h3>
            <p className="text-xs text-slate-400">
              {currentAudio
                ? `Suara ${currentAudio.voice} (${currentAudio.gender === 'wanita' ? 'Wanita' : 'Pria'}) • Mood: ${currentAudio.mood}`
                : 'Belum ada audio yang disintesis. Ketik naskah dan tekan tombol sintesis.'}
            </p>
          </div>
        </div>

        {/* Generate / Sintesis Button in Header */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="relative px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-rose-500/25 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Menyintesis Suara...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>Sintesis Suara (Gemini AI)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Visualizer Area */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 mb-4">
        {/* Canvas Visualizer */}
        <div className="w-full h-18 sm:h-20 flex items-center justify-center mb-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={70}
            className="w-full h-full"
          />
        </div>

        {/* Scrubber Range */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            disabled={!currentAudio}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none disabled:opacity-40"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback action buttons */}
        <div className="flex items-center gap-2">
          {/* Rewind 5s */}
          <button
            type="button"
            onClick={() => skipSeconds(-5)}
            disabled={!currentAudio}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            title="Mundur 5 detik"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {/* Main Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={!currentAudio}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 disabled:opacity-40 transition cursor-pointer"
            title={isPlaying ? 'Jeda' : 'Putar Suara'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          {/* Forward 5s */}
          <button
            type="button"
            onClick={() => skipSeconds(5)}
            disabled={!currentAudio}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            title="Maju 5 detik"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setIsPlaying(true);
              }
            }}
            disabled={!currentAudio}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            title="Ulangi dari Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Playback Rate Chips */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-medium px-1.5 uppercase">
            Speed:
          </span>
          {[0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              disabled={!currentAudio}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                Math.abs(playbackRate - rate) < 0.05
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume & Mute */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            disabled={!currentAudio}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={!currentAudio}
            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        {/* Export Buttons (MP3 & WAV) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Export MP3 */}
          <button
            type="button"
            onClick={handleExportMp3}
            disabled={!currentAudio || isExportingMp3}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-40 transition cursor-pointer"
            title="Konversi dan simpan ke file audio MP3 (160kbps)"
          >
            {isExportingMp3 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengompres MP3...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh MP3</span>
              </>
            )}
          </button>

          {/* Export WAV Master */}
          <button
            type="button"
            onClick={handleExportWav}
            disabled={!currentAudio}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700/80 disabled:opacity-40 transition cursor-pointer"
            title="Unduh master WAV asli (24kHz 16-bit)"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>WAV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
