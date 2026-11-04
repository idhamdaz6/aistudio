export type VoiceGender = 'pria' | 'wanita';

export type PrebuiltVoiceName = 'Puck' | 'Fenrir' | 'Charon' | 'Kore' | 'Zephyr';

export interface VoiceOption {
  id: PrebuiltVoiceName;
  name: string;
  gender: VoiceGender;
  description: string;
  avatar: string;
  badge: string;
  recommendedFor: string;
  samplePhrase: string;
}

export type MoodId =
  | 'ceria'
  | 'formal'
  | 'santai'
  | 'semangat'
  | 'tenang'
  | 'dongeng'
  | 'misterius'
  | 'iklan'
  | 'sedih'
  | 'custom';

export interface MoodOption {
  id: MoodId;
  label: string;
  emoji: string;
  shortDesc: string;
  instructionPrompt: string;
  category: 'Populer' | 'Profesional' | 'Ekspresif';
}

export interface TTSRequest {
  text: string;
  voice: PrebuiltVoiceName;
  gender: VoiceGender;
  mood: MoodId;
  customMood?: string;
  speed: number;
  pitch?: number;
  model?: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';
}

export interface TTSResponse {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  voice?: PrebuiltVoiceName;
  mood?: string;
  text?: string;
  error?: string;
  durationSeconds?: number;
}

export interface GeneratedAudioItem {
  id: string;
  timestamp: number;
  text: string;
  voice: PrebuiltVoiceName;
  gender: VoiceGender;
  mood: MoodId;
  customMood?: string;
  speed: number;
  audioUrl: string;
  audioBlob: Blob;
  durationSeconds: number;
  source: 'gemini' | 'browser-fallback';
}

export interface ScriptSample {
  id: string;
  title: string;
  category: string;
  badge: string;
  suggestedVoice: PrebuiltVoiceName;
  suggestedMood: MoodId;
  text: string;
}
