import React, { useState } from 'react';
import { 
  Sliders, Wand2, FileText, Plus, Shield, Sparkles, 
  Palette, Music, Video, Target, Volume2, Scissors, Loader2, ArrowRight
} from 'lucide-react';

import { Clip } from '../types';

interface InspectorProps {
  selectedClip: Clip | null;
  onUpdateClip: (id: string, updates: Partial<Clip>) => void;
  onAddMarkers?: (markers: number[]) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

export const Inspector: React.FC<InspectorProps> = ({ selectedClip, onUpdateClip, onAddMarkers, showToast }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'ai' | 'color' | 'audio'>('properties');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const runAI = async (action: string) => {
    if (!selectedClip) {
        showToast?.("Please select a clip on the timeline first.", "error");
        return;
    }
    setIsProcessing(action);
    try {
      let endpoint = 'http://localhost:8000/apply';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = { action, file_path: selectedClip.path };

      // Route specific actions to their dedicated endpoints
      if (action === 'scene_detect') {
          endpoint = 'http://localhost:8000/ai/scene_detect';
          // Body is same: { file_path }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (data.status === 'success' && data.output_file) {
          // Force UI refresh by adding timestamp query param if path is same, or just rely on backend creating new name
          // Backend creates new name (e.g. _enhanced), so pure path update is fine.
          onUpdateClip(selectedClip.id, { 
              path: data.output_file,
              name: `AI_${selectedClip.name}`
          });
          showToast?.(`Success: Applied ${action}`, 'success');
      } else if (data.status === 'success' && data.scenes && action === 'scene_detect') {
          // New backend returns 'scenes' array with objects { time: float, frame: int }
          const times = data.scenes.map((s: { time: number }) => Math.round(s.time * 100)); // Convert seconds to pixels (100px/sec)
          onAddMarkers?.(times);
          showToast?.(`Detected ${times.length} scene changes`, 'success');
      } else {
          showToast?.(data.message || "Action completed", data.status === 'success' ? 'success' : 'error');
      }
    } catch {
      showToast?.("Backend error. Is api.py running?", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const applyVoiceEffect = async (effect: string) => {
     if (!selectedClip) return;
     setIsProcessing('voice_fx');
     try {
       const res = await fetch('http://localhost:8000/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             action: 'voice_changer', 
             file_path: selectedClip.path,
             context: { effect } 
          })
       });
       const data = await res.json();
       if (data.status === 'success' && data.output_file) {
          onUpdateClip(selectedClip.id, { 
              path: data.output_file,
              name: `FX_${effect}_${selectedClip.name}`
          });
          showToast?.(`Voice changed to ${effect}`, 'success');
       } else {
           showToast?.("Effect failed", 'error');
       }
     } catch {
         showToast?.("Effect error", 'error');
     } finally {
         setIsProcessing(null);
     }
  };

  return (
    <div className="panel w-[320px] h-full bg-[#0c0c0e] flex flex-col border-l border-[#1f1f23]">
      <div className="h-10 border-b border-[#1f1f23] flex items-center justify-around bg-[#141417]">
        {([
          { id: 'properties', icon: <Sliders size={14} />, label: 'Ins' },
          { id: 'ai', icon: <Wand2 size={14} />, label: 'AI' },
          { id: 'color', icon: <Palette size={14} />, label: 'Col' },
          { id: 'audio', icon: <Music size={14} />, label: 'Aud' }
        ] as const).map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 h-full flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-tighter ${activeTab === tab.id ? 'text-white border-b-2 border-blue-600 bg-white/5' : 'text-zinc-600 hover:text-white'}`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {!selectedClip ? (
            <div className="h-full flex flex-col items-center justify-center text-[#52525b] opacity-40">
                <Target size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">No Selection</p>
            </div>
        ) : (
            <div className="space-y-6">
                {activeTab === 'properties' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-[#141417] p-3 rounded border border-blue-500/20">
                        <p className="text-[10px] text-zinc-600 font-black uppercase">Clip Name</p>
                        <p className="text-[11px] text-white truncate font-mono">{selectedClip.name}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-500">
                            <Video size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Transform</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <span className="text-[8px] text-zinc-600 uppercase font-black">Pos X</span>
                              <input 
                                type="number" 
                                className="w-full bg-black border-[#1f1f23] text-white text-[10px] p-2 rounded outline-none" 
                                value={selectedClip.posX || 0}
                                onChange={(e) => onUpdateClip(selectedClip.id, { posX: parseInt(e.target.value) || 0 })}
                              />
                           </div>
                           <div className="space-y-1">
                              <span className="text-[8px] text-zinc-600 uppercase font-black">Pos Y</span>
                              <input 
                                type="number" 
                                className="w-full bg-black border-[#1f1f23] text-white text-[10px] p-2 rounded outline-none" 
                                value={selectedClip.posY || 0}
                                onChange={(e) => onUpdateClip(selectedClip.id, { posY: parseInt(e.target.value) || 0 })}
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[8px] font-black uppercase text-zinc-600">
                              <span>Scale</span>
                              <span>{selectedClip.scale || 100}%</span>
                           </div>
                           <input 
                             type="range" min="1" max="500" 
                             className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-blue-600"
                             value={selectedClip.scale || 100}
                             onChange={(e) => onUpdateClip(selectedClip.id, { scale: parseInt(e.target.value) })}
                           />
                        </div>
                    </div>
                  </div>
                )}

                {activeTab === 'color' && (
                   <div className="space-y-8 animate-in slide-in-from-right duration-300">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 text-orange-500">
                            <Palette size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Primary Wheels</span>
                         </div>
                         <div className="grid grid-cols-1 gap-6">
                            {([
                               { id: 'temperature', label: 'Temp', icon: <Target size={10} />, min: -100, max: 100, def: 0 },
                               { id: 'tint', label: 'Tint', icon: <Target size={10} />, min: -100, max: 100, def: 0 },
                               { id: 'saturation', label: 'Sat', icon: <Target size={10} />, min: 0, max: 200, def: 100 },
                               { id: 'contrast', label: 'Cont', icon: <Target size={10} />, min: 0, max: 200, def: 100 }
                            ] as const).map(p => (
                               <div key={p.id} className="space-y-2">
                                  <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500">
                                     <span>{p.label}</span>
                                     <span>{selectedClip[p.id] ?? p.def}</span>
                                  </div>
                                  <input 
                                    type="range" min={p.min} max={p.max} 
                                    className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-orange-600"
                                    value={selectedClip[p.id] ?? p.def}
                                    onChange={(e) => onUpdateClip(selectedClip.id, { [p.id]: parseInt(e.target.value) })}
                                  />
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="pt-6 border-t border-[#1f1f23] space-y-4">
                         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Luma / Chrominance</span>
                         <div className="space-y-4">
                            {(['lift', 'gamma', 'gain'] as const).map(mode => (
                               <div key={mode} className="space-y-2">
                                  <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500">
                                     <span>{mode}</span>
                                     <span>{(selectedClip[mode]?.g ?? 1).toFixed(2)}</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="200"
                                    className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-orange-600"
                                    value={(selectedClip[mode]?.g ?? 1) * 100}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) / 100;
                                        onUpdateClip(selectedClip.id, { [mode]: { r: val, g: val, b: val } });
                                    }}
                                  />
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="px-1 py-2">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-3">Neural Engine Tools</span>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                            { id: 'smart_enhance', label: 'Magic Mask', sub: 'Object Isolation', icon: <Shield size={16} />, color: 'text-purple-400', bg: 'hover:bg-purple-500/10' },
                            { id: 'upscale_ai', label: 'Super Scale', sub: '2x / 4x Upscaling', icon: <Plus size={16} />, color: 'text-blue-400', bg: 'hover:bg-blue-500/10' },
                            { id: 'color_boost', label: 'Smart Re-light', sub: 'Virtual Studio', icon: <Sparkles size={16} />, color: 'text-orange-400', bg: 'hover:bg-orange-500/10' },
                            { id: 'enhance_audio', label: 'Voice Isolation', sub: 'De-noise Audio', icon: <Volume2 size={16} />, color: 'text-green-400', bg: 'hover:bg-green-500/10' },
                            { id: 'remove_silence', label: 'Silence Removal', sub: 'Trim Pauses', icon: <Scissors size={16} />, color: 'text-red-400', bg: 'hover:bg-red-500/10' },
                            { id: 'scene_detect', label: 'Scene Detect', sub: 'Auto Cut Points', icon: <Scissors size={16} />, color: 'text-cyan-400', bg: 'hover:bg-cyan-500/10' },
                            ].map(tool => (
                            <button 
                                key={tool.id}
                                onClick={() => !isProcessing && runAI(tool.id)}
                                disabled={isProcessing !== null}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl border border-[#2c2c30] bg-[#141417] transition-all group ${tool.bg} ${isProcessing === tool.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'hover:border-white/20'}`}
                            >
                                <div className={`p-2 rounded-lg bg-[#0c0c0e] ${tool.color} group-hover:scale-110 transition-transform shadow-lg`}>
                                    {isProcessing === tool.id ? <Loader2 size={16} className="animate-spin text-white" /> : tool.icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{tool.label}</h4>
                                    <p className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-400">{isProcessing === tool.id ? 'Processing...' : tool.sub}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                    <ArrowRight size={14} className="text-zinc-500" />
                                </div>
                            </button>
                            ))}

                            <button
                                onClick={async () => {
                                    if (!selectedClip || isProcessing) return;
                                    setIsProcessing("transcribe");
                                    showToast?.("Starting transcription...", "success");
                                    try {
                                            const res = await fetch('http://localhost:8000/ai/transcribe', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ file_path: selectedClip.path })
                                            });
                                            const data = await res.json();
                                            if (data.status === 'success') {
                                                const text = data.transcription.text || JSON.stringify(data.transcription);
                                                onUpdateClip(selectedClip.id, { transcription: text });
                                                showToast?.("Captions attached to clip", 'success');
                                            } else {
                                                showToast?.("Transcription Failed: " + data.message, 'error');
                                            }
                                    } catch { showToast?.("Transcription Error", "error"); }
                                    setIsProcessing(null);
                                }}
                                disabled={isProcessing !== null}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl border border-[#2c2c30] bg-[#141417] transition-all group hover:bg-rose-500/10 hover:border-white/20 ${isProcessing === 'transcribe' ? 'border-blue-500' : ''}`}
                            >
                                <div className={`p-2 rounded-lg bg-[#0c0c0e] text-rose-400 group-hover:scale-110 transition-transform shadow-lg`}>
                                    {isProcessing === 'transcribe' ? <Loader2 size={16} className="animate-spin text-white" /> : <FileText size={16} />}
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">Transcribe</h4>
                                    <p className="text-[9px] font-medium text-zinc-500 group-hover:text-zinc-400">{isProcessing === 'transcribe' ? 'Analyzing Audio...' : 'Generate Captions'}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                    <ArrowRight size={14} className="text-zinc-500" />
                                </div>
                            </button>
                        </div>
                        
                        {selectedClip.transcription && (
                            <div className="mt-4 p-3 bg-[#0a0a0c] rounded border border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
                                <h5 className="text-[10px] font-bold text-zinc-500 uppercase mb-2 flex justify-between items-center">
                                    <span>Transcription</span>
                                    <span className="text-[9px] bg-zinc-800 px-1 rounded text-zinc-400">EN</span>
                                </h5>
                                <p className="text-[11px] text-zinc-300 font-serif leading-relaxed whitespace-pre-wrap h-40 overflow-y-auto custom-scrollbar select-text selection:bg-blue-500/30">
                                    &quot;{selectedClip.transcription}&quot;
                                </p>
                            </div>
                        )}
                    </div>
                  </div>
                )}

                {activeTab === 'audio' && (
                  <div className="space-y-8 animate-in slide-in-from-right duration-300">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-green-500">
                          <Music size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Audio Mixer</span>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <div className="flex justify-between text-[8px] font-black uppercase text-zinc-600">
                                <span>Volume</span>
                                <span>{selectedClip.volume || 100}%</span>
                             </div>
                             <input 
                               type="range" min="0" max="200" 
                               className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-green-600"
                               value={selectedClip.volume || 100}
                               onChange={(e) => onUpdateClip(selectedClip.id, { volume: parseInt(e.target.value) })}
                             />
                          </div>
                          <div className="pt-4 border-t border-[#1f1f23] space-y-4">
                             <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Normalization</p>
                             <button 
                               onClick={() => runAI('audio_normalize')}
                               className="w-full py-2 bg-zinc-900 border border-[#1f1f23] rounded text-[9px] font-bold uppercase tracking-widest hover:border-green-500/50 transition-all"
                             >
                               AI Loudness Leveling
                             </button>
                          </div>
                          
                          <div className="pt-4 border-t border-[#1f1f23] space-y-4">
                             <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Voice Changer Effects</p>
                             <div className="grid grid-cols-2 gap-2">
                                {['chipmunk', 'monster', 'robot', 'echo', 'alien'].map(fx => (
                                    <button key={fx} onClick={() => applyVoiceEffect(fx)} className="px-3 py-2 bg-zinc-900 border border-[#1f1f23] rounded hover:border-blue-500/50 hover:bg-zinc-800 transition-all text-[9px] font-black uppercase text-zinc-400 hover:text-white">
                                        {fx}
                                    </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};