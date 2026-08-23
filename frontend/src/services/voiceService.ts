export const voiceService = {
  speechToText(options: { 
    language?: string, 
    onResult: (text: string, isFinal: boolean) => void, 
    onError: (err: any) => void 
  }) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return { start: () => {}, stop: () => {}, isSupported: false };
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.language || 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        options.onResult(finalTranscript, true);
      } else if (interimTranscript) {
        options.onResult(interimTranscript, false);
      }
    };

    recognition.onerror = (event: any) => {
      options.onError(event.error);
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e) {
          console.error(e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          console.error(e);
        }
      },
      isSupported: true
    };
  },

  textToSpeech(text: string, language?: string, onEnd?: () => void) {
    if (!window.speechSynthesis) {
      return { speak: () => {}, stop: () => {} };
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a matching voice
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      if (language === 'hi-IN') {
        selectedVoice = voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.startsWith('hi'));
      } else if (language === 'gu-IN') {
        selectedVoice = voices.find(v => v.lang === 'gu-IN') || voices.find(v => v.lang.startsWith('gu'));
      } else {
        selectedVoice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = language || 'en-US';
    };

    setVoice();
    
    // Wait for voices to load if they haven't
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    return {
      speak: () => {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        window.speechSynthesis.speak(utterance);
      },
      stop: () => {
        window.speechSynthesis.cancel();
      }
    };
  },

  detectLanguage(text: string): 'en' | 'hi' | 'gu' {
    const textLower = text.toLowerCase();
    
    const gujaratiRegex = /[\u0A80-\u0AFF]/;
    const devanagariRegex = /[\u0900-\u097F]/;
    const hinglishKeywords = ['mujhe', 'tension', 'hai', 'kya', 'bahut', 'nahi', 'karo', 'kaise'];
    
    if (gujaratiRegex.test(text)) {
      return 'gu';
    }
    
    if (devanagariRegex.test(text)) {
      return 'hi';
    }
    
    if (hinglishKeywords.some(keyword => textLower.includes(keyword))) {
      return 'hi';
    }
    
    return 'en';
  }
};
