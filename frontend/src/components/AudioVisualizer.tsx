import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  width?: number;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ videoRef, width = 600, height = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Audio Context
    if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current; // variable name 'ctx' clashes within render loop, let's keep it here

    if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
    }
    const analyser = analyserRef.current;

    // Connect Video to Analyser
    // We must only create MediaElementSource once per element
    if (!sourceRef.current) {
        try {
            sourceRef.current = ctx.createMediaElementSource(videoRef.current);
            sourceRef.current.connect(analyser);
            analyser.connect(ctx.destination);
        } catch (e) {
            console.warn("AudioVisualizer: Failed to connect media source", e);
            // Fallback: If we can't connect real audio, we might fail silently or show static.
        }
    }

    let animationFrameId: number;
    const canvas = canvasRef.current;
    
    const render = () => {
        if (!canvas) return;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = '#0c0c0e';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#10b981'); // Green
            gradient.addColorStop(0.6, '#f59e0b'); // Yellow
            gradient.addColorStop(1, '#ef4444'); // Red

            canvasCtx.fillStyle = gradient;
            
            // Draw bar
            canvasCtx.fillRect(x, canvas.height - barHeight / 1.5, barWidth, barHeight / 1.5);

            x += barWidth + 1;
        }

        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
        cancelAnimationFrame(animationFrameId);
        // Do NOT close AudioContext here as it might be expensive to recreate or break other things if shared
        // But we are creating it locally.
    };
  }, [videoRef]);

  return (
    <div className="w-full h-full bg-[#0c0c0e] rounded overflow-hidden relative border border-[#1f1f23]">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="w-full h-full"
      />
      <div className="absolute top-2 left-2 text-[8px] text-zinc-500 font-mono">RTA FREQUENCY</div>
    </div>
  );
};
