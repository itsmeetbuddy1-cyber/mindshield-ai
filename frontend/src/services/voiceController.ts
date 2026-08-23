import apiService from './api';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED' | 'ERROR' | 'STOPPED';

export interface DebugTelemetry {
  state: VoiceState;
  turnCount: number;
  language: string;
  recognitionActive: boolean;
  ttsActive: boolean;
  lastError: string | null;
  recoveryAttempts: number;
}

class VoiceController {
  public state: VoiceState = 'IDLE';
  public turnCount = 0;
  public selectedLang = 'auto';
  public recoveryAttempts = 0;
  private lastError: string | null = null;
  private isRecognitionActive = false;
  private isTTSActive = false;
  private sessionId = Math.random().toString(36).substring(7);

  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private volumeInterval: any = null;
  private audioStream: MediaStream | null = null;
  private ttsKeepAlive: any = null;

  public onStateChange: (state: VoiceState) => void = () => {};
  public onTranscript: (text: string, isFinal: boolean) => void = () => {};
  public onResponse: (text: string, lang: string) => void = () => {};
  public onVolume: (volume: number) => void = () => {};
  public onDebug: (telemetry: DebugTelemetry) => void = () => {};

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onstart = () => {
        this.isRecognitionActive = true;
        this.sendDebug();
      };
      
      this.recognition.onend = () => {
        this.isRecognitionActive = false;
        this.sendDebug();
        // Auto-restart if we're supposed to be listening
        if (this.state === 'LISTENING') {
            try {
                this.recognition.start();
            } catch (e) {}
        }
      };

      this.recognition.onresult = (event: any) => {
        if (this.state === 'SPEAKING' || this.state === 'THINKING') return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          this.onTranscript(final, true);
          this.processTurn(final);
        } else if (interim) {
          this.onTranscript(interim, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.lastError = event.error;
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            this.changeState('ERROR');
        }
        this.sendDebug();
      };
    }
  }

  private async setupAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    if (!this.audioStream) {
      try {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.microphone = this.audioContext.createMediaStreamSource(this.audioStream);
        this.microphone.connect(this.analyser);
        
        this.volumeInterval = setInterval(() => {
          if (!this.analyser) return;
          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const volume = sum / dataArray.length;
          this.onVolume(volume);

          // Natural interruption
          if (this.state === 'SPEAKING' && volume > 45) {
            this.interrupt();
          }
        }, 100);
      } catch (err) {
        console.error("Audio Context Error", err);
      }
    }
  }

  private changeState(newState: VoiceState) {
    this.state = newState;
    this.onStateChange(newState);
    this.sendDebug();
  }

  private sendDebug() {
    this.onDebug({
      state: this.state,
      turnCount: this.turnCount,
      language: this.selectedLang,
      recognitionActive: this.isRecognitionActive,
      ttsActive: this.isTTSActive,
      lastError: this.lastError,
      recoveryAttempts: this.recoveryAttempts
    });
  }

  public async start(lang: string = 'auto') {
    this.selectedLang = lang;
    this.turnCount = 0;
    this.sessionId = Math.random().toString(36).substring(7);
    await this.setupAudioContext();
    this.startListening();
  }

  public stop() {
    this.changeState('STOPPED');
    this.stopListening();
    this.cancelTTS();
    if (this.volumeInterval) {
        clearInterval(this.volumeInterval);
        this.volumeInterval = null;
    }
    if (this.audioStream) {
        this.audioStream.getTracks().forEach(t => t.stop());
        this.audioStream = null;
    }
  }

  public interrupt() {
    if (this.state === 'SPEAKING') {
      this.cancelTTS();
      this.changeState('INTERRUPTED');
      setTimeout(() => this.startListening(), 100);
    }
  }

  private startListening() {
    this.changeState('LISTENING');
    if (this.recognition) {
      if (this.selectedLang !== 'auto') {
        this.recognition.lang = this.selectedLang;
      } else {
        this.recognition.lang = 'en-US';
      }
      try {
        this.recognition.start();
      } catch (e) {}
    }
  }

  private stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  private async processTurn(text: string) {
    this.stopListening();
    this.changeState('THINKING');
    this.turnCount++;

    try {
      const response = await apiService.analyzeMessage({
        message: text,
        language: this.selectedLang === 'auto' ? undefined : this.selectedLang,
        session_id: this.sessionId
      });

      const aiText = response.data.response || response.data.reply || "I understand.";
      
      this.onResponse(aiText, this.selectedLang);
      this.speak(aiText);
    } catch (error) {
      console.error(error);
      this.lastError = 'API Error';
      // Mock response for offline/demo if API fails
      const fallbackText = "I hear you. Let's work through this together. Please go on.";
      this.onResponse(fallbackText, 'en-US');
      this.speak(fallbackText);
    }
  }

  public speak(text: string) {
    this.changeState('SPEAKING');
    this.isTTSActive = true;
    this.sendDebug();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    let voice = null;
    
    // Simple voice matching based on lang
    if (this.selectedLang === 'hi-IN') {
        voice = voices.find(v => v.lang.includes('hi')) || voices[0];
        utterance.lang = 'hi-IN';
    } else if (this.selectedLang === 'gu-IN') {
        voice = voices.find(v => v.lang.includes('gu')) || voices.find(v => v.lang.includes('hi')) || voices[0];
        utterance.lang = 'gu-IN';
    } else {
        voice = voices.find(v => v.lang.includes('en')) || voices[0];
        utterance.lang = 'en-US';
    }
    if (voice) utterance.voice = voice;

    // Chrome keep-alive hack
    if (this.ttsKeepAlive) clearInterval(this.ttsKeepAlive);
    this.ttsKeepAlive = setInterval(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
        } else {
            clearInterval(this.ttsKeepAlive);
        }
    }, 10000);

    utterance.onend = () => {
        clearInterval(this.ttsKeepAlive);
        this.isTTSActive = false;
        this.sendDebug();
        if (this.state === 'SPEAKING') {
            // Natural pause before listening again
            setTimeout(() => {
                if (this.state !== 'STOPPED' && this.state !== 'IDLE') {
                    this.startListening();
                }
            }, 400);
        }
    };
    
    utterance.onerror = () => {
        clearInterval(this.ttsKeepAlive);
        this.isTTSActive = false;
        this.sendDebug();
        if (this.state === 'SPEAKING') {
            setTimeout(() => this.startListening(), 400);
        }
    }

    window.speechSynthesis.speak(utterance);
  }

  private cancelTTS() {
    if (this.ttsKeepAlive) clearInterval(this.ttsKeepAlive);
    window.speechSynthesis.cancel();
    this.isTTSActive = false;
    this.sendDebug();
  }
}

const voiceController = new VoiceController();
export default voiceController;
