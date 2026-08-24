import React, { useState, useEffect, useRef } from 'react';

interface VoiceAnalyzerProps {
  onVoiceAnalysisComplete: (score: number, features: any) => void;
  isStreamActive?: boolean;
}

const VoiceAnalyzer: React.FC<VoiceAnalyzerProps> = ({ onVoiceAnalysisComplete, isStreamActive = false }) => {
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied' | 'unavailable' | 'disabled'>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [statusMsg, setStatusMsg] = useState('DISABLED');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  
  const [volumeLevel, setVolumeLevel] = useState(0);

  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionStatus(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'idle');
      
      result.onchange = () => {
        setPermissionStatus(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'idle');
      };
    } catch (e) {
      console.warn("Permissions API not supported for microphone");
    }
  };

  useEffect(() => {
    checkPermission();
    return () => stopRecording();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setPermissionStatus('granted');
      setIsRecording(true);
      setStatusMsg('ACTIVE');
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let lastCall = performance.now();
      let pauseCounter = 0;
      let speechCounter = 0;

      const analyzeAudio = (time: number) => {
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        let peakFreq = 0;
        let peakIndex = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
          if (dataArray[i] > peakFreq) {
            peakFreq = dataArray[i];
            peakIndex = i;
          }
        }
        
        const rms = Math.sqrt(sum / bufferLength);
        const normalizedVolume = Math.min(100, (rms / 255) * 100 * 2);
        setVolumeLevel(normalizedVolume);

        if (normalizedVolume > 15) {
          speechCounter++;
        } else {
          pauseCounter++;
        }
        
        if (time - lastCall > 500) {
          // Normalize volume (0-100)
          const loudnessScore = Math.min(100, Math.max(0, normalizedVolume));
          
          // Estimated pitch index in human vocal band
          const pitchScore = Math.min(100, Math.max(0, (peakIndex / bufferLength) * 150));
          
          // Speaking rate indicator: Normal continuous speaking (ratio 0.4 - 0.7) produces calm/mild stress (20-40)
          // Only extreme saturation (e.g. constant screaming or hyper-fast frantic speech) should elevate score
          const totalFrames = Math.max(1, speechCounter + pauseCounter);
          const speechRatio = speechCounter / totalFrames;
          
          // Realistic speaking rate score: 0.5 is optimal conversation (~25 score), 0.95+ indicates rapid breathless speech (~65-75 score)
          const speakingRateScore = Math.min(100, Math.max(15, Math.pow(speechRatio, 1.8) * 75 + 15));
          
          // Pause pattern score: normal conversation pauses (15-30% pauses) are healthy (~20 score)
          const pauseRatio = pauseCounter / totalFrames;
          const pauseScore = Math.min(100, Math.max(15, Math.abs(pauseRatio - 0.25) * 80 + 15));
          
          // Weighted Voice Score = 0.30 * Speaking-rate + 0.25 * Pause + 0.25 * Pitch + 0.20 * Loudness
          let rawVoiceScore = (0.30 * speakingRateScore) + (0.25 * pauseScore) + (0.25 * pitchScore) + (0.20 * loudnessScore);
          
          // Scale to realistic range: quiet/normal speech is 25-45, elevated is 50-70, screaming/crisis is 75-95
          if (normalizedVolume < 10) {
            rawVoiceScore = 20; // Ambient room silence / resting
          } else if (normalizedVolume < 50) {
            rawVoiceScore = Math.min(48, Math.max(22, rawVoiceScore * 0.75)); // Normal conversational tone
          } else {
            rawVoiceScore = Math.min(92, Math.max(45, rawVoiceScore * 0.95)); // Loud / intense voice
          }
          
          const finalVoiceScore = Math.round(Math.min(100, Math.max(15, rawVoiceScore)));
          
          onVoiceAnalysisComplete(finalVoiceScore, {
            speakingRate: Math.round(speakingRateScore),
            pause: Math.round(pauseScore),
            pitch: Math.round(pitchScore),
            loudness: Math.round(loudnessScore),
            voiceScore: finalVoiceScore,
            rms,
            volume: Math.round(normalizedVolume),
          });
          
          lastCall = time;
          speechCounter = 0;
          pauseCounter = 0;
        }

        requestAnimationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      requestAnimationFrameRef.current = requestAnimationFrame(analyzeAudio);

    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setPermissionStatus('denied');
      setStatusMsg('DENIED');
    }
  };

  const stopRecording = () => {
    if (requestAnimationFrameRef.current) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    setStatusMsg('DISABLED');
    setVolumeLevel(0);
  };

  useEffect(() => {
     if (isStreamActive && !isRecording) {
         startRecording();
     } else if (!isStreamActive && isRecording) {
         stopRecording();
     }
     // eslint-disable-next-line
  }, [isStreamActive]);

  const toggleMic = () => {
      if (isRecording) stopRecording();
      else startRecording();
  };

  return (
    <div className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          🎙️ Voice Stress Analysis
        </h3>
        <div className="flex items-center gap-2">
           <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusMsg === 'ACTIVE' ? 'bg-green-100 text-green-700' : statusMsg === 'DENIED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
               {statusMsg}
           </span>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Detects speech prosody, intensity, and pitch variance to estimate emotional distress.
      </p>

      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
        {isRecording ? (
          <div className="flex flex-col items-center cursor-pointer" onClick={toggleMic}>
            <div className="relative flex items-center justify-center w-20 h-20 mb-4">
              <div 
                className="absolute bg-blue-500/30 rounded-full transition-all duration-75"
                style={{ width: `${50 + volumeLevel}%`, height: `${50 + volumeLevel}%` }}
              ></div>
              <div className="z-10 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white animate-pulse">
                🎙️
              </div>
            </div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
              Listening & Processing Locally...
            </p>
          </div>
        ) : (
          <button 
            onClick={toggleMic}
            className="w-16 h-16 bg-slate-200 dark:bg-slate-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 text-2xl rounded-full flex items-center justify-center transition-colors mb-4"
          >
            🎙️
          </button>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
        <span className="text-amber-500 mt-0.5">🔒</span>
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Privacy First: Zero Upload</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
            Audio is processed locally in your browser. No raw recordings are ever stored or sent to any server. Only numeric metrics are extracted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAnalyzer;
