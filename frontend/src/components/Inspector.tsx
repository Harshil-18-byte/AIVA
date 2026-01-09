import React, { useState } from 'react';
import { 
  Sliders, Wand2, Activity, VolumeX, FileText, Scissors 
} from 'lucide-react';

export const Inspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'ai'>('ai');

  return (
    <div className="panel flex-1 h-full min-w-[280px]">
      <div className="panel-header">
        <button 
          onClick={() => setActiveTab('properties')}
          className={`px-3 py-1 mr-2 rounded text-xs font-semibold ${activeTab === 'properties' ? 'bg-[#2c2c30] text-white' : 'text-[#a1a1aa] hover:text-white'}`}
        >
          Properties
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${activeTab === 'ai' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-[#a1a1aa] hover:text-white'}`}
        >
          <Wand2 size={12} />
          AI Tools
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' ? (
          <div className="flex flex-col gap-4">
             <div className="space-y-2">
               <label className="text-xs text-[#52525b] uppercase font-bold">Transform</label>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                   <span className="text-[10px] text-[#a1a1aa] block mb-1">Position X</span>
                   <input type="number" className="w-full" defaultValue={960} />
                 </div>
                 <div>
                   <span className="text-[10px] text-[#a1a1aa] block mb-1">Position Y</span>
                   <input type="number" className="w-full" defaultValue={540} />
                 </div>
               </div>
               <div>
                   <span className="text-[10px] text-[#a1a1aa] block mb-1">Scale</span>
                   <input type="number" className="w-full" defaultValue={100} />
               </div>
               <div>
                   <span className="text-[10px] text-[#a1a1aa] block mb-1">Rotation</span>
                   <input type="number" className="w-full" defaultValue={0} />
               </div>
             </div>

             <div className="w-full h-[1px] bg-[#2c2c30]"></div>

             <div className="space-y-2">
               <label className="text-xs text-[#52525b] uppercase font-bold">Audio</label>
               <div>
                   <span className="text-[10px] text-[#a1a1aa] block mb-1">Volume (dB)</span>
                   <input type="number" className="w-full" defaultValue={0.0} />
               </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-blue-900/10 border border-blue-600/20 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                 <Activity size={16} className="text-blue-500" />
                 <span className="font-bold text-sm text-blue-400">Analysis Complete</span>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Scanned <strong>interview_A_roll.mp4</strong>. Found 3 potential improvements.
              </p>
            </div>

            <div className="space-y-3">
               {/* Suggestion 1 */}
               <div className="border border-[#2c2c30] rounded p-3 hover:border-[#4b4b55] transition-colors group">
                 <div className="flex items-start gap-3 mb-2">
                   <div className="p-2 bg-[#2c2c30] rounded text-[#a1a1aa] group-hover:text-white">
                     <VolumeX size={16} />
                   </div>
                   <div>
                     <h4 className="text-sm font-semibold text-[#e4e4e7]">Remove Silence</h4>
                     <p className="text-[10px] text-[#a1a1aa]">Detected 46 seconds of silence below -45dB.</p>
                   </div>
                 </div>
                 <button className="w-full py-1.5 rounded bg-[#2c2c30] text-xs font-semibold hover:bg-white hover:text-black transition-colors">
                   Apply Cut (Preserve Sync)
                 </button>
               </div>

               {/* Suggestion 2 */}
               <div className="border border-[#2c2c30] rounded p-3 hover:border-[#4b4b55] transition-colors group">
                 <div className="flex items-start gap-3 mb-2">
                   <div className="p-2 bg-[#2c2c30] rounded text-[#a1a1aa] group-hover:text-white">
                     <FileText size={16} />
                   </div>
                   <div>
                     <h4 className="text-sm font-semibold text-[#e4e4e7]">Generate Captions</h4>
                     <p className="text-[10px] text-[#a1a1aa]">Speech detected. Create energetic subtitles?</p>
                   </div>
                 </div>
                 <button className="w-full py-1.5 rounded bg-[#2c2c30] text-xs font-semibold hover:bg-white hover:text-black transition-colors">
                   Transcribe & Create Track
                 </button>
               </div>

                {/* Suggestion 3 */}
               <div className="border border-[#2c2c30] rounded p-3 hover:border-[#4b4b55] transition-colors group">
                 <div className="flex items-start gap-3 mb-2">
                   <div className="p-2 bg-[#2c2c30] rounded text-[#a1a1aa] group-hover:text-white">
                     <Scissors size={16} />
                   </div>
                   <div>
                     <h4 className="text-sm font-semibold text-[#e4e4e7]">Auto-Cut Pauses</h4>
                     <p className="text-[10px] text-[#a1a1aa]">Tighten pacing by removing micro-pauses {'>'} 0.5s.</p>
                   </div>
                 </div>
                 <button className="w-full py-1.5 rounded bg-[#2c2c30] text-xs font-semibold hover:bg-white hover:text-black transition-colors">
                   Review Cuts
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
