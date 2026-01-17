import React from 'react';
import { Loader2, CheckCircle2, XCircle, Film, Volume2, Wand2, Download } from 'lucide-react';

export interface AIJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: number;
  result?: string | { text: string }; // text or file path
  name: string;
}

interface AIStatusPanelProps {
  jobs: AIJob[];
  onImportAsset: (path: string, type: 'video' | 'audio') => void;
  onClearJobs: () => void;
}

export const AIStatusPanel: React.FC<AIStatusPanelProps> = ({ jobs, onImportAsset, onClearJobs }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#0c0c0e] border-r border-[#1f1f23]">
       <div className="h-10 border-b border-[#1f1f23] flex items-center justify-between px-4 bg-[#141417]">
          <div className="flex items-center gap-2 text-blue-400">
             <Wand2 size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">AI Job Queue</span>
          </div>
          <button onClick={onClearJobs} className="text-[9px] text-zinc-500 hover:text-white uppercase font-bold">Clear All</button>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {jobs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-zinc-500 space-y-2">
                  <Wand2 size={48} />
                  <p className="text-xs uppercase font-bold tracking-widest">No Active Jobs</p>
              </div>
          ) : (
              jobs.map(job => (
                  <div key={job.id} className="bg-[#18181b] border border-[#2c2c30] rounded-lg p-3 animate-in fade-in slide-in-from-left duration-300">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                              {job.status === 'processing' && <Loader2 size={12} className="animate-spin text-blue-500" />}
                              {job.status === 'completed' && <CheckCircle2 size={12} className="text-green-500" />}
                              {job.status === 'failed' && <XCircle size={12} className="text-red-500" />}
                              <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-tight">{job.type.replace('_', ' ')}</span>
                          </div>
                          <span className="text-[8px] font-mono text-zinc-600">{new Date(job.date).toLocaleTimeString()}</span>
                      </div>
                      
                      <div className="text-[10px] text-zinc-400 font-mono truncate mb-2" title={job.name}>
                          {job.name}
                      </div>

                      {job.status === 'completed' && job.result && (
                          <div className="bg-[#0a0a0c] rounded p-2 border border-white/5">
                              {job.type === 'transcribe' ? (
                                  <div className="max-h-24 overflow-y-auto custom-scrollbar">
                                      <p className="text-[9px] text-zinc-300 font-serif leading-relaxed italic">
                                          &quot;{typeof job.result === 'object' ? job.result.text : job.result}&quot;
                                      </p>
                                  </div>
                              ) : (
                                  <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-zinc-500">
                                          {job.type.includes('audio') ? <Volume2 size={12} /> : <Film size={12} />}
                                          <span className="text-[8px] uppercase">Processed Asset</span>
                                      </div>
                                      <button 
                                        onClick={() => typeof job.result === 'string' && onImportAsset(job.result, job.type.includes('audio') || job.type === 'voice_isolation' ? 'audio' : 'video')}
                                        className="flex items-center gap-1 text-[8px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-all"
                                      >
                                          <Download size={10} /> Import Result
                                      </button>
                                  </div>
                              )}
                          </div>
                      )}
                      
                      {job.status === 'failed' && (
                          <div className="bg-red-900/10 p-2 rounded border border-red-500/20 text-[9px] text-red-400 font-mono">
                              Error processing request
                          </div>
                      )}
                  </div>
              ))
          )}
       </div>
    </div>
  );
};
