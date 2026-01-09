import React, { useState } from 'react';
import { 
  Play, Pause, Square, SkipBack, SkipForward, 
  ChevronLeft, ChevronRight, Volume2, Maximize2 
} from 'lucide-react';

export const PreviewMonitor: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:14:05");
  const [duration, setDuration] = useState("00:04:22:10");

  return (
    <div className="panel flex-[2] bg-black flex flex-col relative h-full">
      {/* Video Content Area */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden group">
        <div className="w-[80%] aspect-video bg-[#0f0f11] border border-[#2c2c30] flex items-center justify-center">
          <span className="text-[#2c2c30] font-bold text-4xl select-none">NO SIGNAL</span>
        </div>
        
        {/* Overlay Timecode */}
        <div className="absolute top-4 right-4 font-mono text-xl text-[#e4e4e7] opacity-80 select-none">
          {currentTime}
        </div>
      </div>

      {/* Controls */}
      <div className="h-12 bg-[#18181b] border-t border-[#2c2c30] flex items-center justify-between px-4">
        <div className="flex items-center gap-4 text-[#e4e4e7]">
           <span className="font-mono text-xs text-[#a1a1aa]">{currentTime} / {duration}</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-icon" title="Go to Start"><SkipBack size={16} /></button>
          <button className="btn-icon" title="Frame Back"><ChevronLeft size={16} /></button>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-[#e4e4e7] rounded-full text-black hover:bg-white transition-colors"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
          </button>
          <button className="btn-icon" title="Frame Forward"><ChevronRight size={16} /></button>
          <button className="btn-icon" title="Go to End"><SkipForward size={16} /></button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-24">
            <Volume2 size={16} className="text-[#a1a1aa]" />
            <div className="h-1 bg-[#2c2c30] flex-1 rounded-full overflow-hidden">
              <div className="h-full w-[80%] bg-[#e4e4e7]"></div>
            </div>
          </div>
          <button className="btn-icon"><Maximize2 size={16} /></button>
        </div>
      </div>
    </div>
  );
};
