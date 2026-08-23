export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;

  private noiseFloor = 20;
  private thresholdOffset = 12;
  private speechStartThresholdMs = 150;
  private speechEndThresholdMs = 750;
  private bargeInThreshold = 40;

  private isSpeaking = false;
  private isAiSpeaking = false;
  private speechStartTime = 0;
  private speechEndTime = 0;

  public onSpeechStart: () => void = () => {};
  public onSpeechEnd: () => void = () => {};
  public onBargeIn: () => void = () => {};
  public onAudioLevel: (level: number) => void = () => {};

  async start(stream?: MediaStream) {
    this.stop();
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (!stream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } else {
      this.mediaStream = stream;
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.4;
    
    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.source.connect(this.analyser);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.loop();
  }

  setAiSpeaking(isSpeaking: boolean) {
    this.isAiSpeaking = isSpeaking;
  }

  private loop = () => {
    if (!this.analyser || !this.dataArray) return;
    
    this.analyser.getByteFrequencyData(this.dataArray as any);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;
    
    this.onAudioLevel(average);

    const now = Date.now();
    
    if (this.isAiSpeaking && average > this.bargeInThreshold) {
      this.onBargeIn();
    }

    if (average > this.noiseFloor + this.thresholdOffset) {
      if (!this.isSpeaking) {
        if (this.speechStartTime === 0) {
          this.speechStartTime = now;
        } else if (now - this.speechStartTime > this.speechStartThresholdMs) {
          this.isSpeaking = true;
          this.onSpeechStart();
        }
      }
      this.speechEndTime = 0;
    } else {
      this.speechStartTime = 0;
      if (this.isSpeaking) {
        if (this.speechEndTime === 0) {
          this.speechEndTime = now;
        } else if (now - this.speechEndTime > this.speechEndThresholdMs) {
          this.isSpeaking = false;
          this.onSpeechEnd();
        }
      }
    }

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isSpeaking = false;
  }
}
