export type VoiceState = 'IDLE' | 'INITIALIZING' | 'LISTENING' | 'USER_SPEAKING' | 'PROCESSING' | 'AI_SPEAKING' | 'INTERRUPTED' | 'RECOVERING' | 'ERROR' | 'STOPPED';
export type VoiceMode = 'CONVERSATION' | 'PUSH_TO_TALK';
export type SpeechRate = 'slow' | 'normal' | 'fast';
export type VoiceCommand = 'STOP' | 'END_SESSION' | 'SPEAK_SLOWER' | 'SPEAK_FASTER' | 'SPEAK_NORMAL' | 'LANG_HINDI' | 'LANG_GUJARATI' | 'LANG_ENGLISH' | 'REPEAT' | null;

export interface SpeechInputProvider {
  start(): Promise<void>;
  stop(): void;
  setLanguage(lang: string): void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: string, isFatal: boolean) => void;
  isSupported: boolean;
}

export interface SpeechOutputProvider {
  speak(text: string, lang: string, rate: number): Promise<void>;
  stop(): void;
  isSpeaking(): boolean;
  onStart: () => void;
  onEnd: () => void;
  onError: (error: string) => void;
}

export interface VoiceTelemetry {
  state: VoiceState;
  mode: VoiceMode;
  turnCount: number;
  language: string;
  rate: SpeechRate;
  audioLevel: number;
  vadActive: boolean;
  sttEngine: string;
  ttsEngine: string;
  lastCommand: string | null;
  lastError: string | null;
  recoveryCount: number;
  sessionDuration: number;
  currentTopic?: string;
  conversationSummary?: string;
  stressScore?: number;
  stressTrend?: string;
}
