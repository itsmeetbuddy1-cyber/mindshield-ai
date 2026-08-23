export type VoiceState = 
  | 'IDLE' 
  | 'STARTING' 
  | 'LISTENING' 
  | 'USER_SPEAKING' 
  | 'PROCESSING' 
  | 'AI_SPEAKING' 
  | 'INTERRUPTED' 
  | 'RECOVERING' 
  | 'STOPPING' 
  | 'STOPPED' 
  | 'ERROR';

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
  isListening(): boolean;
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
  sessionId: string;
  turnId: string;
  requestId: string;
  state: VoiceState;
  mode: VoiceMode;
  turnCount: number;
  language: string;
  rate: SpeechRate;
  audioLevel: number;
  micStatus: 'ACTIVE' | 'INACTIVE';
  sttStatus: 'ACTIVE' | 'INACTIVE';
  vadStatus: 'ACTIVE' | 'INACTIVE';
  aiStatus: 'IDLE' | 'PROCESSING';
  ttsStatus: 'ACTIVE' | 'INACTIVE';
  currentTranscript: string;
  currentTopic: string;
  conversationSummary: string;
  stressScore: number;
  stressTrend: string;
  lastCommand: string | null;
  lastEvent: string;
  lastError: string | null;
  recoveryCount: number;
  retryCount: number;
  sessionDuration: number;
}

