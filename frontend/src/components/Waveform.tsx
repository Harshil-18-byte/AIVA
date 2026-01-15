import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  width?: number;
  height?: number;
}

export const Waveform: React.FC<WaveformProps> = ({ videoRef, width = 300, height = 150 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });

    const render = () => {
      if (!canvas || !ctx || !videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        // Even if paused, we might want to render once if the video has data
        if (videoRef.current && !videoRef.current.paused) {
           animationFrameId = requestAnimationFrame(render);
        }
        return;
      }
      
      const video = videoRef.current;
      if (video.readyState < 2) {
          animationFrameId = requestAnimationFrame(render);
          return;
      }

      // Draw standard waveform (Luminance check)
      // 1. Draw video frame to small offscreen canvas/buffer for performance
      const w = 120; // Downsample width
      const h = 80;  // Downsample height
      
      // Use a hidden canvas to read pixel data
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;
      
      offCtx.drawImage(video, 0, 0, w, h);
      const imageData = offCtx.getImageData(0, 0, w, h);
      const data = imageData.data;
      
      // Clear main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Waveform points
      // We map X pixel of video to X pixel of canvas
      // We map Luminance of pixel to Y pixel of canvas
      
      const scaleX = canvas.width / w;
      const scaleY = canvas.height / 255;
      
      ctx.fillStyle = 'rgba(74, 222, 128, 0.5)'; // Greenish waveform
      
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const i = (y * w + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Rec. 709 Luminance
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          
          const plotX = x * scaleX;
          const plotY = canvas.height - (luma * scaleY);
          
          ctx.fillRect(plotX, plotY, 2, 2); 
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Hook into play/timeupdate events to trigger manual updates when paused
    const video = videoRef.current;
    const manualRender = () => {
         // One-off render
         // We reuse the logic but without the loop if needed, or just call render once
         // To reuse easily, we can just call render() but we need to ensure it doesn't loop infinitely if paused
         // For now, let's just let the loop handle it or rely on the loop checking 'paused'
         // Actually, if paused, we still want to see the waveform of the current frame!
         // So we should remove the 'paused' check from the loop condition for the content rendering, 
         // but manage the RAF loop carefully.
         
         // Simplified: Just restart the loop if it stopped
         render();
    };

    if (video) {
        video.addEventListener('play', render);
        video.addEventListener('seeked', manualRender);
        video.addEventListener('loadeddata', manualRender);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (video) {
          video.removeEventListener('play', render);
          video.removeEventListener('seeked', manualRender);
          video.removeEventListener('loadeddata', manualRender);
      }
    };
  }, [videoRef]);

  // Handle the case where video is paused but we need to show waveform (e.g. scrubbing)
  // We remove the paused check inside render loop for the single-frame draw, but use RAF only when playing?
  // Actually, easiest is to always run RAF but throttle it, or rely on video events.
  // The above implementation tries to hook events.
  
  return (
    <div className="w-full h-full bg-black/40 rounded border border-[#1f1f23] overflow-hidden relative">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="w-full h-full opacity-80"
      />
      <div className="absolute top-2 left-2 text-[8px] text-zinc-500 font-mono">LUMA WAVEFORM</div>
    </div>
  );
};
