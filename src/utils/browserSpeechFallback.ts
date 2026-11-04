/**
 * Web Speech API helper for client-side Indonesian speech preview
 */

export interface BrowserVoiceInfo {
  name: string;
  lang: string;
  voiceURI: string;
  isIndonesian: boolean;
}

export function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

export function getIndonesianBrowserVoice(): SpeechSynthesisVoice | undefined {
  const voices = getBrowserVoices();
  // Look for id-ID or Indonesian
  return (
    voices.find(
      (v) =>
        v.lang.toLowerCase().includes('id-id') ||
        v.lang.toLowerCase().includes('id_id') ||
        v.lang.toLowerCase().startsWith('id')
    ) || voices[0]
  );
}

export function speakWithBrowser(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): { cancel: () => void } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    throw new Error('Browser tidak mendukung Web Speech API.');
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const indonesianVoice = getIndonesianBrowserVoice();
  if (indonesianVoice) {
    utterance.voice = indonesianVoice;
  }
  utterance.lang = 'id-ID';
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;

  if (options?.onEnd) {
    utterance.onend = options.onEnd;
  }
  if (options?.onError) {
    utterance.onerror = options.onError;
  }

  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => window.speechSynthesis.cancel(),
  };
}
