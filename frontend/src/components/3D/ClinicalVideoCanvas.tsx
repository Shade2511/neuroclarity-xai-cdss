import React, { useState, useEffect, useRef } from 'react';
import { Activity, Play, Pause, RefreshCw, Zap } from 'lucide-react';

export const ClinicalVideoCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<'synapse' | 'ecg'>('synapse');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 480);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for synaptic simulation (light clinical theme)
    const particles = Array.from({ length: 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      radius: Math.random() * 2.5 + 2,
      isPrimary: Math.random() > 0.4,
      pulse: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    const render = () => {
      if (isPlaying) t += 0.025;

      // Clean Light Clinical Canvas Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(0, 0, width, height);

      if (mode === 'synapse') {
        // Draw synaptic axon connections
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          if (isPlaying) {
            p1.x += p1.vx;
            p1.y += p1.vy;
            p1.pulse += 0.04;

            if (p1.x < 0) p1.x = width;
            if (p1.x > width) p1.x = 0;
            if (p1.y < 0) p1.y = height;
            if (p1.y > height) p1.y = 0;
          }

          // Connect adjacent particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 85) {
              const alpha = (1 - dist / 85) * 0.35;
              ctx.strokeStyle = `rgba(15, 118, 110, ${alpha})`;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();

              // Potential impulse pulse
              if (isPlaying && Math.sin(t * 2 + i) > 0.88) {
                const px = p1.x + (p2.x - p1.x) * ((Math.sin(t * 3) + 1) / 2);
                const py = p1.y + (p2.y - p1.y) * ((Math.sin(t * 3) + 1) / 2);
                ctx.fillStyle = '#0F766E';
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // Draw node
          const pulseR = p1.radius + Math.sin(p1.pulse) * 0.6;
          ctx.fillStyle = p1.isPrimary ? '#0F766E' : '#0284C7';
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, pulseR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (mode === 'ecg') {
        // Draw physiological ECG / Rhythm wave
        ctx.strokeStyle = '#0F766E';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const step = 3;
        const cy = height / 2;
        for (let x = 0; x < width; x += step) {
          const phase = (x + t * 80) % width;
          let y = cy;

          // ECG wave pattern
          const rel = (phase % 180) / 180;
          if (rel > 0.35 && rel < 0.4) {
            y = cy - Math.sin((rel - 0.35) * 20 * Math.PI) * 10;
          } else if (rel >= 0.45 && rel < 0.48) {
            y = cy + 8;
          } else if (rel >= 0.48 && rel < 0.54) {
            y = cy - 55;
          } else if (rel >= 0.54 && rel < 0.58) {
            y = cy + 20;
          } else if (rel >= 0.65 && rel < 0.76) {
            y = cy - Math.sin((rel - 0.65) * 9 * Math.PI) * 14;
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, mode]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-white border border-[#E2E8F0] shadow-xs ${className}`}>
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full min-h-[220px] block" />

      {/* Clean Light Overlay Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#059669] telemetry-pulse" />
          <span className="text-[11px] font-semibold text-[#0F172A] uppercase tracking-wider">
            {mode === 'synapse' ? 'Synaptic Neurotransmitter Simulation' : 'Physiological Rhythm (68 BPM)'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-md border border-[#E2E8F0] shadow-2xs">
          <button
            onClick={() => setMode('synapse')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
              mode === 'synapse' ? 'bg-[#0F766E] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Synapse
          </button>
          <button
            onClick={() => setMode('ecg')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
              mode === 'ecg' ? 'bg-[#0F766E] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            ECG
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Ticker */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-md border border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#475569] shadow-2xs">
        <div className="flex items-center space-x-3">
          <span>5-HT Receptor: <strong className="text-[#0F766E]">94.2% Occupied</strong></span>
          <span className="hidden sm:inline">NE Transporter: <strong className="text-[#0284C7]">Normal</strong></span>
        </div>
        <span className="text-[10px] text-[#64748B]">Neurological Feed: <strong>60 FPS</strong></span>
      </div>
    </div>
  );
};
