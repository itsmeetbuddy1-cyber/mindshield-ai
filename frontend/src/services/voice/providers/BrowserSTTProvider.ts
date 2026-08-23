import { SpeechInputProvider } from '../types';

export class BrowserSTTProvider implements SpeechInputProvider {
  private recognition: any = null;
  private lang = 'en-US';
  public isSupported = false;
  
  public onTranscript: (text: string, isFinal: boolean) => void = () => {};
  public onError: (error: string, isFatal: boolean) => void = () => {};
  
  private watchdogTimeout: number | null = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.setupListeners();
    }
  }

  setLanguage(lang: string) {
    this.lang = lang;
    if (this.recognition) this.recognition.lang = lang;
  }

  private setupListeners() {
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
      if (final) {
        this.onTranscript(final, true);
        this.stop(); // Stop after one final result
      } else if (interim) {
        this.onTranscript(interim, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        this.onError(event.error, false);
      } else {
        this.onError(event.error, true);
      }
      this.stop();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.clearWatchdog();
    };
  }

  private resetWatchdog() {
    this.clearWatchdog();
    this.watchdogTimeout = window.setTimeout(() => {
      if (this.isListening) {
        this.onError('timeout', false);
        this.stop();
      }
    }, 6000);
  }

  private clearWatchdog() {
    if (this.watchdogTimeout) {
      clearTimeout(this.watchdogTimeout);
      this.watchdogTimeout = null;
    }
  }

  async start() {
    if (!this.isSupported) throw new Error('Speech Recognition not supported');
    this.stop();
    this.isListening = true;
    this.recognition.lang = this.lang;
    try {
      this.recognition.start();
      this.resetWatchdog();
    } catch (e) {
      this.isListening = false;
      throw e;
    }
  }

  stop() {
    this.isListening = false;
    this.clearWatchdog();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}
