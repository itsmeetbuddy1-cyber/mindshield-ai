import { SpeechOutputProvider } from '../types';

export class BrowserTTSProvider implements SpeechOutputProvider {
  public onStart: () => void = () => {};
  public onEnd: () => void = () => {};
  public onError: (error: string) => void = () => {};

  private speaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private watchdogTimeout: number | null = null;
  private keepAliveInterval: number | null = null;

  async speak(text: string, lang: string, rate: number): Promise<void> {
    return new Promise((resolve) => {
      // 1. Cancel previous speech
      this.stop();

      if (!('speechSynthesis' in window) || !text || text.trim().length === 0) {
        this.cleanup();
        resolve();
        return;
      }

      // Resume synthesis if browser suspended it
      try {
        window.speechSynthesis.resume();
      } catch (e) {}

      this.speaking = true;
      const utterance = new SpeechSynthesisUtterance(text.trim());
      this.currentUtterance = utterance; // Prevent GC collection
      utterance.lang = lang;
      utterance.rate = rate;

      // Safe Voice Matching
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const langCode = lang.split('-')[0].toLowerCase();
          const targetVoice = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase()) ||
                              voices.find(v => v.lang.toLowerCase().startsWith(langCode)) ||
                              voices.find(v => v.default) ||
                              voices[0];
          if (targetVoice) {
            utterance.voice = targetVoice;
          }
        }
      } catch (e) {
        console.warn('Voice matching error (using system default):', e);
      }

      // Dynamic Watchdog based on word count
      const wordCount = text.split(/\s+/).length;
      const expectedDuration = Math.max(4000, ((wordCount / 2) + 4) * 1000);

      utterance.onstart = () => {
        this.speaking = true;
        this.onStart();
        this.startKeepAlive();
        
        this.watchdogTimeout = window.setTimeout(() => {
          if (this.speaking) {
            console.warn('[TTS Watchdog] Force concluding speech after timeout');
            this.forceEnd();
            resolve();
          }
        }, expectedDuration);
      };

      utterance.onend = () => {
        this.cleanup();
        this.onEnd();
        resolve();
      };

      utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        this.cleanup();
        // 'interrupted' or 'canceled' happens naturally when user speaks or stops session
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve();
          return;
        }
        
        console.warn('[TTS Error Handled]:', e.error);
        this.onError(e.error || 'synthesis-error');
        // Phase 17: TTS failure must NEVER kill the conversation
        resolve();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[TTS Speak Exception Handled]:', err);
        this.cleanup();
        resolve();
      }
    });
  }

  stop() {
    this.cleanup();
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  }

  pause() {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
    } catch (e) {}
  }

  resume() {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}
  }

  isSpeaking(): boolean {
    return this.speaking || ('speechSynthesis' in window && window.speechSynthesis.speaking);
  }

  private forceEnd() {
    this.stop();
    this.onEnd();
  }

  private cleanup() {
    this.speaking = false;
    this.currentUtterance = null;
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
    // Chrome bug: long speech pauses after ~15s unless pause/resume is toggled
    this.keepAliveInterval = window.setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        this.cleanup();
      } else {
        try {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } catch (e) {}
      }
    }, 8000);
  }
}
