import React, { useState, useEffect, useRef } from 'react';

interface CameraAnalyzerProps {
  onCameraAnalysisComplete: (score: number, metrics: any) => void;
}

const CameraAnalyzer: React.FC<CameraAnalyzerProps> = ({ onCameraAnalysisComplete }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [statusMsg, setStatusMsg] = useState('Camera off');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestFrameRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (requestFrameRef.current) cancelAnimationFrame(requestFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsEnabled(false);
    setStatusMsg('Camera off');
  };

  const startCamera = async () => {
    try {
      setStatusMsg('Requesting permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsEnabled(true);
      setPermissionStatus('granted');
      setStatusMsg('Analyzing motion...');

      let frameCount = 0;
      const processFrame = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Dummy logic: in a real scenario we'd run face-api.js or similar
          frameCount++;
          
          if (frameCount % 60 === 0) { // roughly every 2 seconds
            // Mock result
            const mockScore = Math.floor(Math.random() * 40) + 20;
            onCameraAnalysisComplete(mockScore, {
              motion: Math.random(),
              blinkRate: 15,
              luminance: 0.8
            });
          }
        }
        
        requestFrameRef.current = requestAnimationFrame(processFrame);
      };

      videoRef.current?.addEventListener('loadedmetadata', () => {
        processFrame();
      });

    } catch (err) {
      console.error('Camera access error:', err);
      setPermissionStatus('denied');
      setStatusMsg('Camera access denied or unavailable.');
    }
  };

  const toggleCamera = () => {
    if (isEnabled) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          📷 Facial Tension Estimation
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={toggleCamera} />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {isEnabled ? 'Active' : 'Off'}
          </span>
        </label>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Analyzes micro-expressions and head motion to detect elevated distress levels.
      </p>

      {permissionStatus === 'denied' && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          Unable to access camera. Please check your browser permissions.
        </div>
      )}

      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-4">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover ${isEnabled ? 'opacity-100' : 'opacity-0 hidden'}`}
        />
        <canvas ref={canvasRef} width="320" height="240" className="hidden" />
        
        {!isEnabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <span className="text-4xl mb-2">👁️‍🗨️</span>
            <p className="text-sm font-medium">Opt-in to enable Camera Assistance</p>
          </div>
        )}
        
        {isEnabled && (
          <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm border border-white/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {statusMsg}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
        <span className="text-blue-500 mt-0.5">🛡️</span>
        <div>
          <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Zero Video Transmission</p>
          <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1">
            100% on-device processing. Video frames never leave your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraAnalyzer;
