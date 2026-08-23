import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type VoiceState = 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';

interface VoiceOrbProps {
  state: VoiceState;
  audioLevel?: number; // 0-100
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, audioLevel = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = 60;

      ctx.clearRect(0, 0, width, height);

      let targetRadius = baseRadius;
      let glowColor = 'rgba(6, 182, 212, 0.5)'; // Cyan
      let coreColor = '#06b6d4';
      
      if (state === 'ready') {
        targetRadius = baseRadius + Math.sin(time * 0.5) * 5;
      } else if (state === 'listening') {
        glowColor = 'rgba(59, 130, 246, 0.6)'; // Blue
        coreColor = '#3b82f6';
        targetRadius = baseRadius + (audioLevel / 100) * 40;
      } else if (state === 'thinking') {
        glowColor = 'rgba(139, 92, 246, 0.5)'; // Purple
        coreColor = '#8b5cf6';
        targetRadius = baseRadius;
      } else if (state === 'speaking') {
        glowColor = 'rgba(16, 185, 129, 0.6)'; // Green
        coreColor = '#10b981';
        targetRadius = baseRadius + (audioLevel / 100) * 30 + Math.sin(time) * 10;
      } else if (state === 'error') {
        glowColor = 'rgba(239, 68, 68, 0.5)'; // Red
        coreColor = '#ef4444';
        targetRadius = baseRadius;
      }

      // Draw Glow
      const gradient = ctx.createRadialGradient(cx, cy, targetRadius * 0.5, cx, cy, targetRadius * 1.5);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.beginPath();
      ctx.arc(cx, cy, targetRadius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Core
      ctx.beginPath();
      ctx.arc(cx, cy, targetRadius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = coreColor;
      ctx.fill();

      // Draw Orbiting Particles (Thinking)
      if (state === 'thinking') {
        for (let i = 0; i < 3; i++) {
          const angle = time + (i * Math.PI * 2) / 3;
          const px = cx + Math.cos(angle) * (baseRadius * 1.2);
          const py = cy + Math.sin(angle) * (baseRadius * 1.2);
          
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, audioLevel]);

  return (
    <div className="flex justify-center items-center relative h-64 w-64 mx-auto">
      <canvas 
        ref={canvasRef} 
        width={256} 
        height={256} 
        className="absolute inset-0"
      />
      <motion.div 
        className="absolute text-white font-bold text-sm pointer-events-none drop-shadow-md z-10"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {state === 'ready' && 'READY'}
        {state === 'listening' && 'LISTENING'}
        {state === 'thinking' && 'THINKING'}
        {state === 'speaking' && 'SPEAKING'}
        {state === 'error' && 'ERROR'}
      </motion.div>
    </div>
  );
};

export default VoiceOrb;
