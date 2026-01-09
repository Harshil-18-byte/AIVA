import React from 'react';
import { 
  Scissors, Type, ArrowRight, Trash2, 
  ZoomIn, ZoomOut, Mic, Eye, EyeOff, Lock, Unlock,
  MoreHorizontal
} from 'lucide-react';

export const Timeline: React.FC = () => {
  return (
    <div className="panel h-[320px] bg-[#18181b] flex flex-col border-t border-[#2c2c30]">
      {/* Timeline Toolbar */}
      <div className="h-9 border-b border-[#2c2c30] flex items-center px-2 justify-between bg-[#18181b]">
        <div className="flex items-center gap-1">
          <button className="btn-icon text-blue-500 bg-[#2c2c30]" title="Select (V)"><ArrowRight size={14} /></button>
          <button className="btn-icon" title="Razor Tool (C)"><Scissors size={14} /></button>
          <button className="btn-icon" title="Type Tool (T)"><Type size={14} /></button>
          <div className="w-[1px] h-4 bg-[#2c2c30] mx-1"></div>
          <button className="btn-icon" title="Ripple Delete"><Trash2 size={14} /></button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#52525b] font-mono">00:00:14:05</span>
          <div className="flex items-center gap-1">
             <button className="btn-icon"><ZoomOut size={14} /></button>
             <div className="w-20 h-1 bg-[#2c2c30] rounded-full relative">
               <div className="absolute left-0 w-8 h-full bg-[#52525b] rounded-full"></div>
             </div>
             <button className="btn-icon"><ZoomIn size={14} /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-48 bg-[#18181b] border-r border-[#2c2c30] flex flex-col">
          {/* V1 Header */}
          <div className="h-16 border-b border-[#2c2c30] flex flex-col justify-center px-2 relative group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#a1a1aa] group-hover:text-[#e4e4e7]">V1</span>
              <div className="flex gap-1">
                <button className="text-[#52525b] hover:text-[#e4e4e7]"><Lock size={12} /></button>
                <button className="text-[#52525b] hover:text-[#e4e4e7]"><Eye size={12} /></button>
              </div>
            </div>
          </div>
          {/* V2 Header */}
          <div className="h-16 border-b border-[#2c2c30] flex flex-col justify-center px-2 relative group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#a1a1aa] group-hover:text-[#e4e4e7]">V2</span>
              <div className="flex gap-1">
                <button className="text-[#52525b] hover:text-[#e4e4e7]"><Lock size={12} /></button>
                <button className="text-[#52525b] hover:text-[#e4e4e7]"><Eye size={12} /></button>
              </div>
            </div>
          </div>
           {/* A1 Header */}
           <div className="h-16 border-b border-[#2c2c30] flex flex-col justify-center px-2 relative group bg-[#131315]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#a1a1aa] group-hover:text-[#e4e4e7]">A1</span>
              <div className="flex gap-1">
                <button className="text-[#52525b] hover:text-[#e4e4e7]"><Lock size={12} /></button>
                <button className="text-[#52525b] hover:text-[#e4e4e7]"><Mic size={12} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Tracks Area */}
        <div className="flex-1 bg-[#1f1f23] relative overflow-x-auto overflow-y-hidden">
           {/* Time Ruler */}
           <div className="h-6 bg-[#18181b] border-b border-[#2c2c30] sticky top-0 z-10 w-[2000px] flex items-end pb-1 select-none">
             {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-1 text-[9px] text-[#52525b] border-l border-[#2c2c30] pl-1 font-mono">
                  00:0{i}:00
                </div>
             ))}
           </div>
           
           {/* Playhead */}
           <div className="absolute top-0 left-[300px] h-full w-[1px] bg-red-500 z-20 pointer-events-none">
             <div className="w-3 h-3 -ml-1.5 bg-red-500 rotate-45 transform -mt-1.5"></div>
           </div>

           {/* Clips Container */}
           <div className="relative w-[2000px]">
             {/* V1 Track */}
             <div className="h-16 border-b border-[#2c2c30]/50 relative">
               <div className="absolute left-[100px] top-1 bottom-1 w-[400px] bg-blue-900/50 border border-blue-600/50 rounded overflow-hidden group cursor-pointer">
                 <div className="h-full w-full flex items-center justify-center opacity-30 group-hover:opacity-50">
                    <span className="text-xs text-blue-200 font-mono">interview_A_roll.mp4</span>
                 </div>
               </div>
               <div className="absolute left-[520px] top-1 bottom-1 w-[200px] bg-purple-900/50 border border-purple-600/50 rounded overflow-hidden cursor-pointer">
                  <div className="h-full w-full flex items-center justify-center opacity-30">
                    <span className="text-xs text-purple-200 font-mono">b_roll_city.mp4</span>
                 </div>
               </div>
             </div>

             {/* V2 Track */}
             <div className="h-16 border-b border-[#2c2c30]/50 relative">
                <div className="absolute left-[350px] top-1 bottom-1 w-[150px] bg-orange-900/50 border border-orange-600/50 rounded overflow-hidden cursor-pointer">
                  <div className="h-full w-full flex items-center justify-center opacity-30">
                    <span className="text-xs text-orange-200 font-mono">Overlay_Text</span>
                 </div>
               </div>
             </div>

             {/* A1 Track */}
             <div className="h-16 border-b border-[#2c2c30]/50 relative bg-[#131315]">
                <div className="absolute left-[100px] top-1 bottom-1 w-[620px] bg-green-900/40 border border-green-600/50 rounded overflow-hidden cursor-pointer">
                   {/* Fake Waveform */}
                   <div className="w-full h-full flex items-center gap-[1px] opacity-40 px-1">
                      {[...Array(50)].map((_,i) => (
                        <div key={i} className="flex-1 bg-green-500" style={{height: `${Math.random() * 80 + 20}%`}}></div>
                      ))}
                   </div>
                </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
};
