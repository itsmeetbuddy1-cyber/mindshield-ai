import { 
  VoiceState, 
  VoiceMode, 
  SpeechRate, 
  VoiceTelemetry, 
  SpeechInputProvider, 
  SpeechOutputProvider 
} from './types';
import { BrowserSTTProvider } from './providers/BrowserSTTProvider';
import { BrowserTTSProvider } from './providers/BrowserTTSProvider';
import { VoiceActivityDetector } from './VoiceActivityDetector';
import { VoiceCommandParser } from './VoiceCommandParser';
import apiService from '../api';

export class VoiceSessionManager {
  // Master State Machine
  private state: VoiceState = 'IDLE';
  private mode: VoiceMode = 'CONVERSATION';
  private language = 'en-IN';
  private rate: SpeechRate = 'normal';

  // Identifiers for session isolation
  private sessionId = '';
  private currentTurnCount = 0;
  private currentTurnId = '';
  private currentRequestId = '';
  private sessionStartTime = 0;

  // Single-authority resources
  private stt: SpeechInputProvider;
  private tts: SpeechOutputProvider;
  private vad: VoiceActivityDetector;
  private sharedMediaStream: MediaStream | null = null;
  private activeAbortController: AbortController | null = null;

  // State watchdogs & concurrency locks
  private stateWatchdog: number | null = null;
  private turnLocked = false;
  private retryCount = 0;
  private recoveryCount = 0;

  // Live telemetry & conversation memory
  private currentTranscript = '';
  private currentAudioLevel = 0;
  private vadActive = false;
  private lastCommand: string | null = null;
  private lastEvent = 'INITIAL';
  private lastError: string | null = null;
  private currentTopic = 'General';
  private conversationSummary = '';
  private stressScore = 45;
  private stressTrend = 'stable';

  // Subscribers
  private stateListeners: Set<(state: VoiceState) => void> = new Set();
  private telemetryListeners: Set<(telemetry: VoiceTelemetry) => void> = new Set();
  private transcriptListeners: Set<(text: string, isFinal: boolean) => void> = new Set();

  constructor() {
    this.stt = new BrowserSTTProvider();
    this.tts = new BrowserTTSProvider();
    this.vad = new VoiceActivityDetector();
    this.setupListeners();
  }

  // ==========================================
  // 1. SETUP LISTENERS & EVENT ROUTING
  // ==========================================
  private setupListeners() {
    // VAD Audio RMS
    this.vad.onAudioLevel = (level) => {
      this.currentAudioLevel = level;
      this.notifyTelemetry();
    };

    // VAD Speech Start
    this.vad.onSpeechStart = () => {
      this.vadActive = true;
      this.logEvent('VAD_SPEECH_START');

      if (this.state === 'AI_SPEAKING') {
        // Phase 18: Instant Barge-in Interruption
        this.logEvent('BARGE_IN_TRIGGERED');
        this.abortActiveRequest();
        this.tts.stop();
        this.transition('INTERRUPTED');
        setTimeout(() => {
          if (this.state === 'INTERRUPTED') {
            this.transition('USER_SPEAKING');
          }
        }, 100);
      } else if (this.state === 'LISTENING') {
        this.transition('USER_SPEAKING');
      }
    };

    // VAD Speech End
    this.vad.onSpeechEnd = () => {
      this.vadActive = false;
      this.logEvent('VAD_SPEECH_END');
    };

    // VAD Loud Sound Barge-in
    this.vad.onBargeIn = () => {
      if (this.state === 'AI_SPEAKING') {
        this.logEvent('BARGE_IN_AUDIO_PEAK');
        this.abortActiveRequest();
        this.tts.stop();
        this.transition('INTERRUPTED');
        setTimeout(() => {
          if (this.state === 'INTERRUPTED') {
            this.transition('USER_SPEAKING');
          }
        }, 100);
      }
    };

    // STT Transcript handler
    this.stt.onTranscript = (text, isFinal) => {
      this.currentTranscript = text;
      this.transcriptListeners.forEach(l => l(text, isFinal));
      this.notifyTelemetry();

      if (isFinal) {
        this.logEvent(`STT_FINAL_RESULT: "${text}"`);
        this.handleFinalUtterance(text);
      } else {
        this.logEvent(`STT_INTERIM_RESULT: "${text}"`);
      }
    };

    // STT Error handler
    this.stt.onError = (err, isFatal) => {
      this.logEvent(`STT_ERROR: ${err} (fatal=${isFatal})`);
      this.lastError = err;

      if (err === 'no-speech' || err === 'aborted') {
        // Non-fatal normal speech pauses
        if (this.state === 'LISTENING' || this.state === 'USER_SPEAKING') {
          setTimeout(() => this.resumeListening(), 200);
        }
      } else if (isFatal) {
        this.handleRecovery('STT_FATAL_ERROR');
      } else {
        if (this.state === 'LISTENING') {
          setTimeout(() => this.resumeListening(), 400);
        }
      }
    };

    // TTS Start & End callbacks
    this.tts.onStart = () => {
      this.logEvent('TTS_START');
      this.vad.setAiSpeaking(true);
      this.notifyTelemetry();
    };

    this.tts.onEnd = () => {
      this.logEvent('TTS_END');
      this.vad.setAiSpeaking(false);
      if (this.state === 'AI_SPEAKING') {
        this.transition('LISTENING');
        this.resumeListening();
      }
    };

    this.tts.onError = (error) => {
      this.logEvent(`TTS_ERROR: ${error}`);
      this.vad.setAiSpeaking(false);
      // Phase 17: TTS failure must never kill the conversation
      if (this.state === 'AI_SPEAKING') {
        this.transition('LISTENING');
        this.resumeListening();
      }
    };
  }

  // ==========================================
  // 2. STRICT STATE TRANSITIONS & TIMEOUT WATCHDOGS
  // ==========================================
  private transition(newState: VoiceState) {
    if (this.state === newState) return;
    this.logEvent(`STATE: ${this.state} -> ${newState}`);
    this.state = newState;

    if (this.stateWatchdog) {
      clearTimeout(this.stateWatchdog);
      this.stateWatchdog = null;
    }

    if (newState === 'PROCESSING') {
      this.stateWatchdog = window.setTimeout(() => {
        if (this.state === 'PROCESSING') {
          console.warn('[Watchdog] AI processing timed out. Recovering to LISTENING.');
          this.handleRecovery('AI_PROCESSING_TIMEOUT');
        }
      }, 10000);
    } else if (newState === 'AI_SPEAKING') {
      this.vad.setAiSpeaking(true);
      this.stateWatchdog = window.setTimeout(() => {
        if (this.state === 'AI_SPEAKING') {
          console.warn('[Watchdog] TTS playback watchdog expired. Returning to LISTENING.');
          this.vad.setAiSpeaking(false);
          this.tts.stop();
          this.transition('LISTENING');
          this.resumeListening();
        }
      }, 20000);
    } else {
      this.vad.setAiSpeaking(false);
    }

    this.stateListeners.forEach(l => l(this.state));
    this.notifyTelemetry();
  }

  // ==========================================
  // 3. SESSION LIFECYCLE MANAGEMENT
  // ==========================================
  async startSession() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.currentTurnCount = 0;
    this.currentTurnId = 'turn_000';
    this.sessionStartTime = Date.now();
    this.retryCount = 0;
    this.recoveryCount = 0;
    this.lastError = null;
    this.currentTranscript = '';

    this.logEvent(`SESSION_START: ${this.sessionId}`);
    this.transition('STARTING');

    try {
      // 1. Obtain single media stream
      if (!this.sharedMediaStream) {
        this.sharedMediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      }

      // 2. Initialize VAD with shared stream
      await this.vad.start(this.sharedMediaStream);

      // 3. Configure STT
      this.stt.setLanguage(this.language);

      // 4. Begin listening
      this.transition('LISTENING');
      await this.resumeListening();
    } catch (err: any) {
      this.lastError = err.message || String(err);
      this.logEvent(`SESSION_START_FAILED: ${this.lastError}`);
      this.transition('ERROR');
    }
  }

  stopSession() {
    this.logEvent(`SESSION_STOP: ${this.sessionId}`);
    this.transition('STOPPING');

    this.abortActiveRequest();
    this.tts.stop();
    this.stt.stop();
    this.vad.stop();

    if (this.sharedMediaStream) {
      this.sharedMediaStream.getTracks().forEach(t => t.stop());
      this.sharedMediaStream = null;
    }

    this.transition('STOPPED');
  }

  private async resumeListening() {
    if (this.state !== 'LISTENING' && this.state !== 'USER_SPEAKING') return;
    this.turnLocked = false;
    try {
      await this.stt.start();
      this.notifyTelemetry();
    } catch (e) {
      console.warn('STT start exception caught:', e);
    }
  }

  // ==========================================
  // 4. PROCESS FINAL UTTERANCE (ATOMIC GATING)
  // ==========================================
  private async handleFinalUtterance(rawTranscript: string) {
    const transcript = rawTranscript.trim();

    // Phase 9: Zero Empty Requests
    if (!transcript || transcript.length < 2) {
      this.logEvent('EMPTY_TRANSCRIPT_SKIPPED');
      this.transition('LISTENING');
      this.resumeListening();
      return;
    }

    // Phase 6: Single-Utterance Atomic Gating
    if (this.turnLocked) {
      this.logEvent('DUPLICATE_TURN_BLOCKED');
      return;
    }
    this.turnLocked = true;

    // Increment turn identifiers
    this.currentTurnCount++;
    this.currentTurnId = `turn_${String(this.currentTurnCount).padStart(3, '0')}`;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    this.currentRequestId = requestId;

    const captureSessionId = this.sessionId;
    const captureTurnId = this.currentTurnId;

    this.logEvent(`TURN_DISPATCH: [${captureTurnId}] req=${requestId} msg="${transcript}"`);

    // Voice Command check
    const command = VoiceCommandParser.parse(transcript);
    this.lastCommand = command;
    if (command) {
      this.executeCommand(command);
      return;
    }

    this.transition('PROCESSING');
    this.stt.stop();

    // Setup AbortController for network cancellation
    this.abortActiveRequest();
    this.activeAbortController = new AbortController();

    try {
      const langCode = this.language.startsWith('hi') ? 'hi' : this.language.startsWith('gu') ? 'gu' : 'en';

      let aiText = '';
      try {
        const res = await apiService.analyzeMessage({
          message: transcript,
          language: langCode,
          session_id: captureSessionId
        });

        // Verify active turn validity
        if (this.sessionId !== captureSessionId || this.currentTurnId !== captureTurnId || this.currentRequestId !== requestId) {
          this.logEvent(`OBSOLETE_RESPONSE_DROPPED: [${captureTurnId}]`);
          return;
        }

        aiText = res.data?.response || res.data?.reply || '';
        if (res.data?.current_topic) this.currentTopic = res.data.current_topic;
        if (res.data?.conversation_summary) this.conversationSummary = res.data.conversation_summary;
        if (res.data?.stress_score !== undefined) this.stressScore = res.data.stress_score;
        if (res.data?.stress_trend) this.stressTrend = res.data.stress_trend;
      } catch (apiErr: any) {
        if (apiErr.name === 'AbortError') {
          this.logEvent('API_REQUEST_ABORTED');
          return;
        }
        console.warn('API call failed, generating contextual fallback:', apiErr);
      }

      if (!aiText) {
        aiText = this.getFallbackReply(transcript);
      }

      // Check state before speaking
      if (this.state !== 'PROCESSING' || this.currentTurnId !== captureTurnId) {
        this.logEvent('STATE_CHANGED_DURING_PROCESSING_SPEECH_ABORTED');
        return;
      }

      this.transition('AI_SPEAKING');
      await this.tts.speak(aiText, this.language, this.getRateNumber());

      // If still AI_SPEAKING after TTS finishes, return to LISTENING
      if ((this.state as VoiceState) === 'AI_SPEAKING' && this.currentTurnId === captureTurnId) {
        this.transition('LISTENING');
        this.resumeListening();
      }
    } catch (error: any) {
      this.lastError = error.message || String(error);
      this.logEvent(`TURN_ERROR: ${this.lastError}`);
      this.handleRecovery('TURN_EXECUTION_ERROR');
    }
  }

  // ==========================================
  // 5. ERROR RECOVERY & RESILIENCE
  // ==========================================
  private handleRecovery(reason: string) {
    this.recoveryCount++;
    this.logEvent(`RECOVERY_TRIGGERED: ${reason} (count=${this.recoveryCount})`);

    this.abortActiveRequest();
    this.tts.stop();
    this.stt.stop();

    this.transition('RECOVERING');

    setTimeout(async () => {
      if (this.state === 'RECOVERING') {
        this.turnLocked = false;
        this.transition('LISTENING');
        await this.resumeListening();
      }
    }, 600);
  }

  private abortActiveRequest() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  // ==========================================
  // 6. VOICE COMMANDS & SPEED/LANGUAGE
  // ==========================================
  public executeCommand(cmd: string) {
    this.logEvent(`VOICE_COMMAND_EXECUTED: ${cmd}`);
    switch(cmd) {
      case 'STOP':
        this.tts.stop();
        this.transition('LISTENING');
        this.resumeListening();
        break;
      case 'END_SESSION':
        this.stopSession();
        break;
      case 'SPEAK_SLOWER':
        this.rate = 'slow';
        this.tts.speak('Speaking slower now.', this.language, this.getRateNumber()).then(() => this.resumeListening());
        break;
      case 'SPEAK_FASTER':
        this.rate = 'fast';
        this.tts.speak('Speaking faster now.', this.language, this.getRateNumber()).then(() => this.resumeListening());
        break;
      case 'SPEAK_NORMAL':
        this.rate = 'normal';
        this.tts.speak('Resetting to normal speed.', this.language, this.getRateNumber()).then(() => this.resumeListening());
        break;
      case 'LANG_HINDI':
        this.language = 'hi-IN';
        this.stt.setLanguage(this.language);
        this.tts.speak('मैंने हिंदी में बात करना शुरू कर दिया है।', this.language, this.getRateNumber()).then(() => this.resumeListening());
        break;
      case 'LANG_GUJARATI':
        this.language = 'gu-IN';
        this.stt.setLanguage(this.language);
        this.tts.speak('હું હવે ગુજરાતીમાં વાત કરીશ.', this.language, this.getRateNumber()).then(() => this.resumeListening());
        break;
      case 'LANG_ENGLISH':
        this.language = 'en-IN';
        this.stt.setLanguage(this.language);
        this.tts.speak('Switched back to English.', this.language, this.getRateNumber()).then(() => this.resumeListening());
        break;
    }
    this.notifyTelemetry();
  }

  private getRateNumber(): number {
    if (this.rate === 'slow') return 0.85;
    if (this.rate === 'fast') return 1.2;
    return 1.0;
  }

  private getFallbackReply(text: string): string {
    const tLower = text.toLowerCase();
    if (this.language.startsWith('hi') || tLower.includes('tension') || tLower.includes('hai')) {
      return "Main samajh raha hoon ki abhi kafi stress feel ho raha hai. Pehle ek gehri saans lete hain aur ek-ek step karke solve karte hain.";
    }
    if (this.language.startsWith('gu') || tLower.includes('chhe') || tLower.includes('chinta')) {
      return "હું સમજી શકું છું કે તમે તણાવ અનુભવી રહ્યા છો. ચાલો એક ઊંડો શ્વાસ લઈએ અને સરળ રીતે શરૂઆત કરીએ.";
    }
    return "I hear you clearly. When facing stressful demands, taking a single grounding breath and tackling one small task creates immediate relief.";
  }

  // ==========================================
  // 7. PUBLIC CONTROLS & EVENT SUBSCRIPTIONS
  // ==========================================
  public setLanguage(lang: string) {
    this.language = lang;
    this.stt.setLanguage(lang);
    this.logEvent(`LANGUAGE_SET: ${lang}`);
    this.notifyTelemetry();
  }

  public setRate(rate: SpeechRate) {
    this.rate = rate;
    this.logEvent(`RATE_SET: ${rate}`);
    this.notifyTelemetry();
  }

  public setMode(mode: VoiceMode) {
    this.mode = mode;
    this.logEvent(`MODE_SET: ${mode}`);
    this.notifyTelemetry();
  }

  public interrupt() {
    this.logEvent('MANUAL_USER_INTERRUPT');
    this.abortActiveRequest();
    this.tts.stop();
    this.transition('LISTENING');
    this.resumeListening();
  }

  public onStateChange(listener: (state: VoiceState) => void) {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }

  public onTelemetry(listener: (telemetry: VoiceTelemetry) => void) {
    this.telemetryListeners.add(listener);
    this.notifyTelemetry();
    return () => this.telemetryListeners.delete(listener);
  }

  public onTranscript(listener: (text: string, isFinal: boolean) => void) {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  private logEvent(event: string) {
    this.lastEvent = event;
    console.log(`[VoiceSessionManager] [${this.currentTurnId || 'turn_000'}] ${event}`);
  }

  private notifyTelemetry() {
    const t: VoiceTelemetry = {
      sessionId: this.sessionId || 'none',
      turnId: this.currentTurnId || 'turn_000',
      requestId: this.currentRequestId || 'none',
      state: this.state,
      mode: this.mode,
      turnCount: this.currentTurnCount,
      language: this.language,
      rate: this.rate,
      audioLevel: this.currentAudioLevel,
      micStatus: this.sharedMediaStream && this.sharedMediaStream.active ? 'ACTIVE' : 'INACTIVE',
      sttStatus: this.stt.isListening() ? 'ACTIVE' : 'INACTIVE',
      vadStatus: this.vadActive ? 'ACTIVE' : 'INACTIVE',
      aiStatus: this.state === 'PROCESSING' ? 'PROCESSING' : 'IDLE',
      ttsStatus: this.tts.isSpeaking() ? 'ACTIVE' : 'INACTIVE',
      currentTranscript: this.currentTranscript,
      currentTopic: this.currentTopic,
      conversationSummary: this.conversationSummary,
      stressScore: this.stressScore,
      stressTrend: this.stressTrend,
      lastCommand: this.lastCommand,
      lastEvent: this.lastEvent,
      lastError: this.lastError,
      recoveryCount: this.recoveryCount,
      retryCount: this.retryCount,
      sessionDuration: this.sessionStartTime ? Math.floor((Date.now() - this.sessionStartTime) / 1000) : 0
    };
    this.telemetryListeners.forEach(l => l(t));
  }
}

export const voiceSessionManager = new VoiceSessionManager();
export const voiceAgentEngine = voiceSessionManager;
export const VoiceAgentEngine = VoiceSessionManager;
