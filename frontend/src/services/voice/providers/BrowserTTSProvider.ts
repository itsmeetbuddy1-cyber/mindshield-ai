import { SpeechOutputProvider } from '../types';

export class BrowserTTSProvider implements SpeechOutputProvider {
  public onStart: () => void = () => {};
  public onEnd: () => void = () => {};
  public onError: (error: string) => void = () => {};

  private speaking = false;
  private watchdogTimeout: number | null = null;
  private keepAliveInterval: number | null = null;

  async speak(text: string, lang: string, rate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();
      this.speaking = true;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith(lang)) || voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      const wordCount = text.split(' ').length;
      const expectedDuration = ((wordCount / 2) + 3) * 1000;

      utterance.onstart = () => {
        this.onStart();
        this.startKeepAlive();
        this.watchdogTimeout = window.setTimeout(() => {
          if (this.speaking) {
            this.forceEnd();
          }
        }, expectedDuration);
      };

      utterance.onend = () => {
        this.cleanup();
        resolve();
      };

      utterance.onerror = (e) => {
        this.cleanup();
        this.onError(e.error);
        reject(e);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stop() {
    this.cleanup();
    window.speechSynthesis.cancel();
  }

  isSpeaking() {
    return this.speaking;
  }

  private forceEnd() {
    this.stop();
    this.onEnd();
  }

  private cleanup() {
    this.speaking = false;
    if (this.watchdogTimeout) {
      clearTimeout(this.watchdogTimeout);
      this.watchdogTimeout = null;
    }
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private startKeepAlive() {
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
    this.keepAliveInterval = window.setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        this.cleanup();
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }
}
