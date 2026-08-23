import { SpeechInputProvider } from '../types';

export class BrowserSTTProvider implements SpeechInputProvider {
  private recognition: any = null;
  private lang = 'en-US';
  public isSupported = false;
  
  public onTranscript: (text: string, isFinal: boolean) => void = () => {};
  public onError: (error: string, isFatal: boolean) => void = () => {};
  
  private watchdogTimeout: number | null = null;
  private listening = false;
  private starting = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported = true;
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.setupListeners();
      } catch (e) {
        console.warn('Failed to initialize SpeechRecognition instance:', e);
        this.isSupported = false;
      }
    }
  }

  setLanguage(lang: string) {
    this.lang = lang;
    if (this.recognition) {
      try {
        this.recognition.lang = lang;
      } catch (e) {}
    }
  }

  private setupListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.listening = true;
      this.starting = false;
      this.resetWatchdog();
    };

    this.recognition.onresult = (event: any) => {
      this.resetWatchdog();
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const trimmedFinal = final.trim();
      const trimmedInterim = interim.trim();

      if (trimmedFinal && trimmedFinal.length > 0) {
        this.stop(); // Stop immediately upon obtaining final utterance
        this.onTranscript(trimmedFinal, true);
      } else if (trimmedInterim && trimmedInterim.length > 0) {
        this.onTranscript(trimmedInterim, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.clearWatchdog();
      const err = event.error || 'unknown';

      // Non-fatal, normal speech lifecycle errors
      if (err === 'no-speech' || err === 'aborted') {
        this.onError(err, false);
      } else if (err === 'not-allowed' || err === 'audio-capture') {
        this.onError(err, true);
      } else {
        this.onError(err, false);
      }
      this.stop();
    };

    this.recognition.onend = () => {
      this.listening = false;
      this.starting = false;
      this.clearWatchdog();
    };
  }

  private resetWatchdog() {
    this.clearWatchdog();
    this.watchdogTimeout = window.setTimeout(() => {
      if (this.listening) {
        this.onError('timeout', false);
        this.stop();
      }
    }, 9000);
  }

  private clearWatchdog() {
    if (this.watchdogTimeout) {
      clearTimeout(this.watchdogTimeout);
      this.watchdogTimeout = null;
    }
  }

  async start() {
    if (!this.isSupported || !this.recognition) {
      throw new Error('Speech Recognition not supported in this browser');
    }
    if (this.listening || this.starting) return;

    this.starting = true;
    this.recognition.lang = this.lang;

    try {
      this.recognition.start();
      this.resetWatchdog();
    } catch (e: any) {
      this.starting = false;
      this.listening = false;
      // If recognition is already started, ignore error
      if (!String(e).includes('already started')) {
        console.warn('SpeechRecognition.start exception:', e);
      }
    }
  }

  stop() {
    this.listening = false;
    this.starting = false;
    this.clearWatchdog();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  abort() {
    this.listening = false;
    this.starting = false;
    this.clearWatchdog();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
  }

  isListening(): boolean {
    return this.listening;
  }
}
