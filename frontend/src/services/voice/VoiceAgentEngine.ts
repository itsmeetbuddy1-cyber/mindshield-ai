import { VoiceState, VoiceMode, SpeechRate, VoiceTelemetry, SpeechInputProvider, SpeechOutputProvider } from './types';
import { BrowserSTTProvider } from './providers/BrowserSTTProvider';
import { BrowserTTSProvider } from './providers/BrowserTTSProvider';
import { VoiceActivityDetector } from './VoiceActivityDetector';
import { VoiceCommandParser } from './VoiceCommandParser';
import apiService from '../api';

class VoiceAgentEngine {
  private state: VoiceState = 'IDLE';
  private mode: VoiceMode = 'CONVERSATION';
  private language = 'en-IN';
  private rate: SpeechRate = 'normal';
  private turnCount = 0;
  private sessionStartTime = 0;
  private sessionId = Math.random().toString(36).substring(7);
  
  private stt: SpeechInputProvider;
  private tts: SpeechOutputProvider;
  private vad: VoiceActivityDetector;
  
  private stateWatchdog: number | null = null;
  private stateListeners: Set<(state: VoiceState) => void> = new Set();
  private telemetryListeners: Set<(telemetry: VoiceTelemetry) => void> = new Set();
  private transcriptListeners: Set<(text: string, isFinal: boolean) => void> = new Set();

  private lastCommand: string | null = null;
  private lastError: string | null = null;
  private recoveryCount = 0;
  private vadActive = false;
  private currentAudioLevel = 0;
  private currentTopic: string = "General";
  private conversationSummary: string = "";
  private stressScore: number = 45;
  private stressTrend: string = "stable";

  constructor() {
    this.stt = new BrowserSTTProvider();
    this.tts = new BrowserTTSProvider();
    this.vad = new VoiceActivityDetector();
    this.setupProviders();
  }

  private setupProviders() {
    this.vad.onAudioLevel = (level) => {
      this.currentAudioLevel = level;
      this.notifyTelemetry();
    };
    this.vad.onSpeechStart = () => {
      this.vadActive = true;
      if (this.state === 'LISTENING') {
        this.transition('USER_SPEAKING');
      } else if (this.state === 'AI_SPEAKING') {
        // Interruption
        this.tts.stop();
        this.transition('USER_SPEAKING');
      }
    };
    this.vad.onSpeechEnd = () => {
      this.vadActive = false;
    };
    this.vad.onBargeIn = () => {
      if (this.state === 'AI_SPEAKING') {
        this.tts.stop();
        this.transition('USER_SPEAKING');
      }
    };

    this.stt.onTranscript = (text, isFinal) => {
      this.transcriptListeners.forEach(l => l(text, isFinal));
      if (isFinal) {
        this.handleTranscript(text);
      }
    };
    
    this.stt.onError = (err, isFatal) => {
      this.lastError = err;
      if (err === 'no-speech' && this.mode === 'CONVERSATION') {
        if (this.state === 'LISTENING' || this.state === 'USER_SPEAKING') {
          setTimeout(() => this.startListening(), 100);
        }
      } else if (isFatal) {
        this.transition('ERROR');
      }
    };
  }

  private transition(newState: VoiceState) {
    if (this.state === newState) return;
    this.state = newState;
    
    if (this.stateWatchdog) {
      clearTimeout(this.stateWatchdog);
      this.stateWatchdog = null;
    }

    if (newState === 'PROCESSING') {
      this.stateWatchdog = window.setTimeout(() => {
        if (this.state === 'PROCESSING') this.recover('LISTENING');
      }, 8000);
    } else if (newState === 'AI_SPEAKING') {
      this.vad.setAiSpeaking(true);
      this.stateWatchdog = window.setTimeout(() => {
        if (this.state === 'AI_SPEAKING') this.recover('LISTENING');
      }, 15000);
    } else {
      this.vad.setAiSpeaking(false);
    }

    this.stateListeners.forEach(l => l(this.state));
    this.notifyTelemetry();
  }

  private recover(targetState: VoiceState) {
    this.recoveryCount++;
    this.tts.stop();
    this.stt.stop();
    this.transition('RECOVERING');
    setTimeout(() => {
      this.transition(targetState);
      if (targetState === 'LISTENING') this.startListening();
    }, 500);
  }

  async startSession() {
    this.sessionStartTime = Date.now();
    this.turnCount = 0;
    this.transition('INITIALIZING');
    try {
      await this.vad.start();
      this.stt.setLanguage(this.language);
      this.transition('LISTENING');
      this.startListening();
    } catch (e) {
      this.lastError = String(e);
      this.transition('ERROR');
    }
  }

  stopSession() {
    this.tts.stop();
    this.stt.stop();
    this.vad.stop();
    this.transition('STOPPED');
  }

  private async startListening() {
    try {
      await this.stt.start();
    } catch (e) {}
  }

  private async handleTranscript(text: string) {
    const command = VoiceCommandParser.parse(text);
    this.lastCommand = command;
    if (command) {
      this.executeCommand(command);
      return;
    }

    this.transition('PROCESSING');
    this.turnCount++;
    
    try {
      let aiText = '';
      try {
        const langCode = this.language.startsWith('hi') ? 'hi' : this.language.startsWith('gu') ? 'gu' : 'en';
        const res = await apiService.analyzeMessage({
          message: text,
          language: langCode,
          session_id: this.sessionId
        });
        aiText = res.data?.response || res.data?.reply || '';
        if (res.data?.current_topic) this.currentTopic = res.data.current_topic;
        if (res.data?.conversation_summary) this.conversationSummary = res.data.conversation_summary;
        if (res.data?.stress_score !== undefined) this.stressScore = res.data.stress_score;
        if (res.data?.stress_trend) this.stressTrend = res.data.stress_trend;
      } catch (apiErr) {
        console.warn('Real AI API failed, using fallback:', apiErr);
      }

      if (!aiText) {
        aiText = this.getFallbackReply(text);
      }

      if ((this.state as VoiceState) !== 'PROCESSING') return;
      
      this.transition('AI_SPEAKING');
      await this.tts.speak(aiText, this.language, this.getRateNumber());
      
      if ((this.state as VoiceState) === 'AI_SPEAKING') {
        setTimeout(() => {
          this.transition('LISTENING');
          this.startListening();
        }, 400);
      }
    } catch (e) {
      this.lastError = String(e);
      this.recover('LISTENING');
    }
  }
  
  private getFallbackReply(text: string): string {
    const tLower = text.toLowerCase();
    if (this.language.startsWith('hi') || tLower.includes('hai') || tLower.includes('tension')) {
      return "Main samajhta hoon ki aap abhi kafi stress feel kar rahe hain. Chaliye ek gehri saans lete hain aur aage badhte hain.";
    }
    if (this.language.startsWith('gu') || tLower.includes('chhe') || tLower.includes('chinta')) {
      return "હું સમજું છું કે તમે તણાવ અનુભવી રહ્યા છો. ચાલો એક ઊંડો શ્વાસ લઈએ અને સાથે મળીને ઉકેલ શોધીએ.";
    }
    return "I understand what you're experiencing. Let's take a calm, deep breath together and work through this.";
  }

  public executeCommand(cmd: string) {
    switch(cmd) {
      case 'STOP':
        this.tts.stop();
        this.transition('LISTENING');
        this.startListening();
        break;
      case 'END_SESSION':
        this.stopSession();
        break;
      case 'SPEAK_SLOWER':
        this.rate = 'slow';
        this.tts.speak('Okay, I will speak slower.', this.language, this.getRateNumber()).then(() => this.startListening());
        break;
      case 'SPEAK_FASTER':
        this.rate = 'fast';
        this.tts.speak('Okay, I will speak faster.', this.language, this.getRateNumber()).then(() => this.startListening());
        break;
      case 'SPEAK_NORMAL':
        this.rate = 'normal';
        this.tts.speak('Okay, back to normal speed.', this.language, this.getRateNumber()).then(() => this.startListening());
        break;
      case 'LANG_HINDI':
        this.language = 'hi-IN';
        this.stt.setLanguage(this.language);
        this.tts.speak('मैंने हिंदी में बात करना शुरू कर दिया है।', this.language, this.getRateNumber()).then(() => this.startListening());
        break;
      case 'LANG_GUJARATI':
        this.language = 'gu-IN';
        this.stt.setLanguage(this.language);
        this.tts.speak('હું હવે ગુજરાતીમાં વાત કરીશ.', this.language, this.getRateNumber()).then(() => this.startListening());
        break;
      case 'LANG_ENGLISH':
        this.language = 'en-IN';
        this.stt.setLanguage(this.language);
        this.tts.speak('I will speak in English now.', this.language, this.getRateNumber()).then(() => this.startListening());
        break;
    }
    this.notifyTelemetry();
  }

  private getRateNumber(): number {
    if (this.rate === 'slow') return 0.8;
    if (this.rate === 'fast') return 1.25;
    return 1.0;
  }

  public setMode(mode: VoiceMode) {
    this.mode = mode;
    this.notifyTelemetry();
  }

  public onStateChange(listener: (s: VoiceState) => void) {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onTelemetry(listener: (t: VoiceTelemetry) => void) {
    this.telemetryListeners.add(listener);
    return () => this.telemetryListeners.delete(listener);
  }

  public onTranscript(listener: (t: string, f: boolean) => void) {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  private notifyTelemetry() {
    const t: VoiceTelemetry = {
      state: this.state,
      mode: this.mode,
      turnCount: this.turnCount,
      language: this.language,
      rate: this.rate,
      audioLevel: this.currentAudioLevel,
      vadActive: this.vadActive,
      sttEngine: 'Browser',
      ttsEngine: 'Browser',
      lastCommand: this.lastCommand,
      lastError: this.lastError,
      recoveryCount: this.recoveryCount,
      sessionDuration: this.sessionStartTime ? Math.floor((Date.now() - this.sessionStartTime) / 1000) : 0,
      currentTopic: this.currentTopic,
      conversationSummary: this.conversationSummary,
      stressScore: this.stressScore,
      stressTrend: this.stressTrend
    };
    this.telemetryListeners.forEach(l => l(t));
  }
}

export const voiceAgentEngine = new VoiceAgentEngine();
