import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize2, Zap 
} from 'lucide-react';

import { Clip } from '../types';

interface PreviewMonitorProps {
  selectedClip: Clip | null;
  playheadPos: number;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  hideControls?: boolean;
  projectDuration?: number; 
  viewMode?: 'source' | 'timeline';
}

export const PreviewMonitor = React.forwardRef<HTMLVideoElement, PreviewMonitorProps>(({ 
    selectedClip, playheadPos, isPlaying, setIsPlaying, hideControls, projectDuration = 60, viewMode = 'timeline'
}, ref) => {
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localDuration, setLocalDuration] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0); // For source mode updates
  
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  
  React.useImperativeHandle(ref, () => internalVideoRef.current!);

  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (pixelsOrSeconds: number, isSecondsInput = false) => {
    const totalSeconds = isSecondsInput ? pixelsOrSeconds : pixelsOrSeconds / 100;
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    const f = Math.floor((totalSeconds % 1) * 25);
    return `00:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}:${f < 10 ? '0'+f : f}`;
  };

  const canPlayAsVideo = (path: string) => {
    const lower = path.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm') || lower.endsWith('.mkv') || lower.endsWith('.wav') || lower.endsWith('.mp3');
  };

  // Playback State Synchronization
  useEffect(() => {
    if (internalVideoRef.current) {
      if (isPlaying) {
        internalVideoRef.current.play().catch(e => {
             if (e.name !== 'AbortError') console.log('Play prohibited/failed:', e);
        });
      } else {
        internalVideoRef.current.pause();
      }
    }
  }, [isPlaying, selectedClip?.id]);

  // Volume Synchronization
  useEffect(() => {
    if (internalVideoRef.current) {
      const globalVol = isMuted ? 0 : volume / 100;
      const clipVol = selectedClip?.volume !== undefined ? selectedClip.volume / 100 : 1;
      internalVideoRef.current.volume = Math.max(0, Math.min(1, globalVol * clipVol));
    }
  }, [volume, isMuted, selectedClip?.volume]);

  // Time Synchronization
  useEffect(() => {
    if (!internalVideoRef.current || !selectedClip || viewMode === 'source') return;
    
    if (selectedClip.type === 'transition' || selectedClip.type === 'effect') return;

    const PIXELS_PER_SECOND = 100;
    const timelineTimeSeconds = playheadPos / PIXELS_PER_SECOND;
    const clipStartSeconds = (selectedClip.start || 0) / PIXELS_PER_SECOND;
    const targetVideoTime = Math.max(0, timelineTimeSeconds - clipStartSeconds);
    
    if (isPlaying) {
      if (Math.abs(internalVideoRef.current.currentTime - targetVideoTime) > 0.3) {
        internalVideoRef.current.currentTime = targetVideoTime;
      }
    } else {
      if (Number.isFinite(targetVideoTime)) {
         if (Math.abs(internalVideoRef.current.currentTime - targetVideoTime) > 0.01) {
            internalVideoRef.current.currentTime = targetVideoTime;
         }
      }
    }
  }, [playheadPos, isPlaying, selectedClip, viewMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const isPlayableVideo = selectedClip && (selectedClip.type === 'video' || !selectedClip.type) && !selectedClip.path.startsWith('builtin');

  // Logic for display
  const displayDuration = (viewMode === 'source' && localDuration > 0) ? localDuration : (projectDuration || 60);
  const displayCurrent = (viewMode === 'source') ? currentTime : (playheadPos / 100);

  return (
    <div ref={containerRef} className={`panel ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'flex-[2]'} bg-[#0c0c0e] flex flex-col relative h-full group/monitor`}>
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        {selectedClip ? (
            <div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
              style={{ perspective: '1000px' }}
            >
            <div className="relative group/vid overflow-hidden w-full h-full flex items-center justify-center" style={{
                transform: `translate(${selectedClip.posX || 0}px, ${selectedClip.posY || 0}px) scale(${(selectedClip.scale || 100) / 100})`,
                opacity: (selectedClip.opacity ?? 100) / 100,
                filter: `
                    saturate(${(selectedClip.saturation ?? 100) / 100}) 
                    contrast(${(selectedClip.contrast ?? 100) / 100}) 
                    brightness(${1 + (selectedClip.gain?.r || 0) / 100})
                    hue-rotate(${(selectedClip.tint || 0)}deg)
                    ${selectedClip.temperature ? `sepia(${(selectedClip.temperature > 0 ? selectedClip.temperature : 0) / 100})` : ''}
                `,
                transition: 'transform 0.1s linear, filter 0.2s ease-out',
            }}>
                {isPlayableVideo ? (
                    canPlayAsVideo(selectedClip.path) ? (
                        <video 
                            ref={internalVideoRef}
                            src={selectedClip.path} 
                            className={`max-w-full max-h-full shadow-2xl ${
                            selectedClip?.type === 'video' && selectedClip.name.toLowerCase().includes('wipe') 
                            ? (selectedClip.name.toLowerCase().includes('right') ? 'transition-active-wipe-right' : 'transition-active-wipe-left')
                            : (selectedClip?.name.toLowerCase().includes('dissolve') ? 'transition-active-cross-dissolve' : '')
                            }`}
                            onEnded={() => setIsPlaying(false)}
                            onTimeUpdate={(e) => viewMode === 'source' && setCurrentTime(e.currentTarget.currentTime)}
                            onDurationChange={(e) => setLocalDuration(e.currentTarget.duration)}
                            loop={false}
                            crossOrigin="anonymous" 
                        />
                    ) : (
                        <img 
                            src={selectedClip.path} 
                            className="max-w-full max-h-full shadow-2xl"
                            alt={selectedClip.name}
                        />
                    )
                ) : (
                    <div className={`flex flex-col items-center gap-4 text-zinc-500 ${selectedClip.type === 'transition' ? 'animate-pulse' : ''}`}>
                        {selectedClip.type === 'transition' ? (
                           <div className="w-full h-full flex items-center justify-center bg-purple-900/20 rounded-xl border border-purple-500/50 p-8">
                             <div className="text-center space-y-2">
                                <Zap size={64} className="mx-auto text-purple-400 animate-bounce" />
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">{selectedClip.name}</h3>
                                <p className="text-xs text-purple-300 font-mono">Simulating Effect...</p>
                             </div>
                           </div>
                        ) : <Volume2 size={48} />}
                        {selectedClip.type !== 'transition' && <span className="text-xs font-black uppercase tracking-widest">{selectedClip.name}</span>}
                    </div>
                )}
                
                <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay animate-pulse bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center opacity-20">
                <Maximize2 size={64} className="text-[#2c2c30] mb-4" />
                <span className="text-[#2c2c30] font-black text-4xl select-none tracking-widest uppercase">No Source</span>
            </div>
        )}
        
        <div className="absolute top-4 right-4 font-mono text-lg text-blue-500/80 bg-black/40 px-2 py-1 rounded border border-blue-500/20 select-none">
          {formatTime(displayCurrent || 0, true)}
        </div>
      </div>

       {!hideControls && (
        <div className="h-12 bg-[#141417] border-t border-[#2c2c30] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
             <span className="font-mono text-[9px] text-[#52525b] font-bold uppercase tracking-tight">
                {formatTime(displayCurrent || 0, true)} / {formatTime(displayDuration, true)}
             </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="p-1.5 hover:bg-white/5 rounded text-[#a1a1aa] hover:text-white transition-all"><SkipBack size={14} /></button>
            <button className="p-1.5 hover:bg-white/5 rounded text-[#a1a1aa] hover:text-white transition-all"><ChevronLeft size={14} /></button>
            <button 
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shadow-lg ${isPlaying ? 'bg-red-600 text-white' : 'bg-white text-black hover:scale-110'}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="black" className="ml-1" />}
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded text-[#a1a1aa] hover:text-white transition-all"><ChevronRight size={14} /></button>
            <button className="p-1.5 hover:bg-white/5 rounded text-[#a1a1aa] hover:text-white transition-all"><SkipForward size={14} /></button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 group cursor-pointer">
              <button onClick={() => setIsMuted(!isMuted)} className="text-[#52525b] group-hover:text-blue-500">
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div className="h-1 w-16 bg-[#2c2c30] rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const newVolume = Math.round((x / rect.width) * 100);
                setVolume(Math.max(0, Math.min(100, newVolume)));
                setIsMuted(false);
              }}>
                <div className="h-full bg-blue-600" style={{ width: `${volume}%` }}></div>
              </div>
            </div>
            <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/5 rounded text-[#a1a1aa] hover:text-white"><Maximize2 size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
});
PreviewMonitor.displayName = 'PreviewMonitor';
