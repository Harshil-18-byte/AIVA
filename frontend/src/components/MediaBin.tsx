import React, { useState } from 'react';
import { Film, Music, Image as ImageIcon, Search, Grip, List, Zap, Layers, Sparkles, Plus, Trash2 } from 'lucide-react';

import { Asset } from '../types';

interface MediaBinProps {
  assets: Asset[];
  setSelectedAssetId: (id: string | null) => void;
  setSelectedClipId: (id: string | null) => void;
  onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
  onDeleteAsset?: (id: string) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
  fullView?: boolean;
}

export const MediaBin = React.memo((props: MediaBinProps) => {
  const { assets, setSelectedAssetId, setSelectedClipId, onUpdateAsset, onDeleteAsset, showToast, fullView } = props;
  const [activeTab, setActiveTab] = useState<'project' | 'transitions' | 'effects'>('project');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All Clips');
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

  const folders = ['All Clips', 'A-Roll', 'B-Roll', 'Sound FX', 'Renders', 'Smart Bins'];

  // Built-in transitions
  const builtInTransitions: Asset[] = [
    { id: 'trans-1', name: 'Cross Dissolve', type: 'transition', path: 'builtin://cross-dissolve', color: '#9333ea' },
    { id: 'trans-2', name: 'Dip to Black', type: 'transition', path: 'builtin://dip-black', color: '#000000' },
    { id: 'trans-3', name: 'Dip to White', type: 'transition', path: 'builtin://dip-white', color: '#ffffff' },
    { id: 'trans-4', name: 'Fade In', type: 'transition', path: 'builtin://fade-in', color: '#3b82f6' },
    { id: 'trans-5', name: 'Fade Out', type: 'transition', path: 'builtin://fade-out', color: '#ef4444' },
    { id: 'trans-6', name: 'Wipe Left', type: 'transition', path: 'builtin://wipe-left', color: '#10b981' },
    { id: 'trans-7', name: 'Wipe Right', type: 'transition', path: 'builtin://wipe-right', color: '#10b981' },
    { id: 'trans-8', name: 'Push', type: 'transition', path: 'builtin://push', color: '#f59e0b' },
  ];

  // Built-in effects
  const builtInEffects: Asset[] = [
    { id: 'fx-1', name: 'Blur', type: 'effect', path: 'builtin://blur', color: '#6366f1' },
    { id: 'fx-2', name: 'Sharpen', type: 'effect', path: 'builtin://sharpen', color: '#8b5cf6' },
    { id: 'fx-3', name: 'Vignette', type: 'effect', path: 'builtin://vignette', color: '#ec4899' },
    { id: 'fx-4', name: 'Film Grain', type: 'effect', path: 'builtin://grain', color: '#78716c' },
    { id: 'fx-5', name: 'Lens Flare', type: 'effect', path: 'builtin://flare', color: '#fbbf24' },
    { id: 'fx-6', name: 'Chromatic Aberration', type: 'effect', path: 'builtin://chromatic', color: '#06b6d4' },
  ];

  // Filter assets based on active tab and folder
  const getDisplayAssets = () => {
    if (activeTab === 'transitions') return builtInTransitions;
    if (activeTab === 'effects') return builtInEffects;
    
    // Project tab - filter by folder and search
    let filtered = assets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      
      // Folder filtering
      if (selectedFolder === 'All Clips') return true;
      if (selectedFolder === 'A-Roll') return a.type === 'video' && (a.scene || a.name.toLowerCase().includes('a-roll') || a.name.toLowerCase().includes('interview'));
      if (selectedFolder === 'B-Roll') return a.type === 'video' && (a.name.toLowerCase().includes('b-roll') || a.name.toLowerCase().includes('broll'));
      if (selectedFolder === 'Sound FX') return a.type === 'audio';
      if (selectedFolder === 'Renders') return a.name.toLowerCase().includes('render') || a.name.toLowerCase().includes('export');
      if (selectedFolder === 'Smart Bins') return a.scene || a.take || a.reel;
      
      return true;
    });
    return filtered;
  };

  const filteredAssets = getDisplayAssets();

  return (
    <div className={`panel flex flex-col bg-[#0c0c0e] ${fullView ? 'flex-1 h-full' : 'w-72 border-r border-[#2c2c30]'}`}>
      <div className="h-10 bg-[#141417] border-b border-[#2c2c30] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${fullView ? 'bg-orange-500' : 'bg-blue-500'} animate-pulse`}></div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">{fullView ? 'Media Storage' : 'Master Pool'}</span>
        </div>
        <div className="flex gap-1">
           <button className="p-1 hover:bg-[#2c2c30] rounded transition-colors" title="Search"><Search size={14} className="text-[#52525b]" /></button>
           <button className="p-1 hover:bg-[#2c2c30] rounded transition-colors" title="Add Bin"><Plus size={14} className="text-[#52525b]" /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Bins - Only show for project tab */}
        {activeTab === 'project' && (
          <div className="w-32 bg-[#0c0c0e] border-r border-[#1f1f23] p-2 flex flex-col gap-1 overflow-y-auto track-hide-scrollbar">
             {folders.map(f => (
                <button 
                  key={f}
                  onClick={() => setSelectedFolder(f)}
                  className={`text-[9px] text-left px-2 py-1.5 rounded transition-all uppercase font-bold tracking-tight ${
                     selectedFolder === f ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {f}
                </button>
             ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-8 border-b border-[#1f1f23] flex items-center px-4 gap-6 bg-[#0c0c0e]/50">
             <div className="flex gap-4">
                 {(['project', 'transitions', 'effects'] as const).map(t => (
                   <button 
                     key={t}
                     onClick={() => setActiveTab(t)}
                     className={`text-[8px] uppercase font-black tracking-widest transition-all ${
                        activeTab === t ? 'text-blue-400' : 'text-zinc-600 hover:text-zinc-400'
                     }`}
                   >
                     {t}
                   </button>
                ))}
             </div>
             <div className="flex-1 h-4 bg-black/40 rounded flex items-center px-2">
                <input 
                  type="text" 
                  placeholder="Filter pool..." 
                  className="bg-transparent border-none text-[8px] w-full lowercase tracking-tighter outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <div className="flex gap-2">
                <button 
                    onClick={() => {
                        if (activeAssetId && onDeleteAsset) {
                           onDeleteAsset(activeAssetId);
                           setActiveAssetId(null);
                        }
                    }} 
                    className={`p-1 ${activeAssetId ? 'text-red-500 hover:bg-red-500/10' : 'text-zinc-700 cursor-not-allowed'}`}
                    disabled={!activeAssetId}
                    title="Delete Selected Asset"
                >
                    <Trash2 size={12} />
                </button>
                <div className="w-[1px] h-3 bg-[#2c2c30] self-center"></div>
                <button onClick={() => setViewMode('grid')} className={`p-1 ${viewMode === 'grid' ? 'text-white' : 'text-zinc-600'}`}><Grip size={12} /></button>
                <button onClick={() => setViewMode('list')} className={`p-1 ${viewMode === 'list' ? 'text-white' : 'text-zinc-600'}`}><List size={12} /></button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {viewMode === 'grid' ? (
              <div className={`grid gap-3 ${fullView ? 'grid-cols-6' : 'grid-cols-2'}`}>
                {filteredAssets.map(asset => (
                  <div 
                    key={asset.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('application/aiva-asset', JSON.stringify(asset))}
                    onClick={() => { setActiveAssetId(asset.id); setSelectedAssetId(asset.id); setSelectedClipId(null); }}
                    className={`group relative bg-[#141417] border rounded-lg overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer aspect-video ${activeAssetId === asset.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#1f1f23]'}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: asset.color || '#000' }}>
                       {asset.type === 'transition' && <Zap size={32} className="text-white/30" />}
                       {asset.type === 'effect' && <Sparkles size={32} className="text-white/30" />}
                       {asset.type === 'video' && <Film size={24} className="text-zinc-800" />}
                       {asset.type === 'audio' && <Music size={24} className="text-zinc-800" />}
                    </div>
                    {asset.type === 'video' && asset.path && !asset.path.startsWith('builtin://') && (
                       <video src={asset.path} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" muted />
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="text-[8px] font-bold text-white truncate uppercase tracking-tighter">{asset.name}</p>
                      <div className="flex justify-between items-center mt-1">
                         <span className="text-[7px] text-zinc-500 font-mono">{asset.duration || '00:00'}</span>
                         <span className="text-[6px] px-1 bg-zinc-800 text-zinc-400 rounded uppercase font-black">
                           {asset.type === 'transition' ? 'TRANS' : asset.type === 'effect' ? 'FX' : asset.resolution || 'RAW'}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                 {filteredAssets.map(asset => (
                     <div key={asset.id} className={`flex items-center gap-3 p-2 rounded hover:bg-[#1f1f23] transition-colors border ${activeAssetId === asset.id ? 'border-blue-500 bg-blue-500/10' : 'border-[#1f1f23] bg-[#141417]/40'} group cursor-pointer`} onClick={() => { setActiveAssetId(asset.id); setSelectedAssetId(asset.id); setSelectedClipId(null); }}>
                        {asset.type === 'transition' && <Zap size={12} className="text-purple-500 opacity-50" />}
                        {asset.type === 'effect' && <Sparkles size={12} className="text-pink-500 opacity-50" />}
                        {asset.type === 'video' && <Film size={12} className="text-blue-500 opacity-50" />}
                        {asset.type === 'audio' && <Music size={12} className="text-green-500 opacity-50" />}
                        <span className="text-[9px] flex-1 truncate font-mono text-zinc-300">{asset.name}</span>
                        <span className="text-[8px] text-zinc-600 font-mono">{asset.duration}</span>
                     </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* Professional Metadata Panel (Full View only) */}
        {fullView && (
           <div className="w-64 bg-[#0c0c0e] border-l border-[#1f1f23] p-4 animate-in slide-in-from-right duration-300">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-6">Metadata Inspector</h3>
              <div className="space-y-4">
                 {[
                    { label: 'Scene', key: 'scene', def: '001' },
                    { label: 'Take', key: 'take', def: '04' },
                    { label: 'Reel', key: 'reel', def: 'A042' },
                    { label: 'Lens', key: 'lens', def: '35mm T1.5' },
                    { label: 'Camera', key: 'camera', def: 'ARRI ALEXA 35' },
                    { label: 'Codec', key: 'codec', def: 'ProRes 4444 XQ' },
                    { label: 'Color Space', key: 'colorspace', def: 'LogC4' }
                 ].map(m => (
                     <div key={m.label} className="space-y-1">
                        <p className="text-[7px] font-black text-zinc-600 uppercase tracking-tighter">{m.label}</p>
                        <input 
                          type="text" 
                          value={(assets.find(a => a.id === activeAssetId) as Asset | undefined)?.[m.key as keyof Asset] || ''}
                          onChange={(e) => activeAssetId && onUpdateAsset(activeAssetId, { [m.key]: e.target.value } as Partial<Asset>)}
                          placeholder={m.def}
                          className="w-full bg-black/40 border-[#1f1f23] text-[9px] text-white p-1.5 rounded font-mono outline-none focus:border-blue-500/50"
                        />
                     </div>
                 ))}
              </div>
              <div className="h-px bg-zinc-800 mt-6"></div>
              <div className="mt-8 pt-6 border-t border-[#1f1f23]">
                 <button 
                   onClick={async () => {
                     const selectedAsset = assets.find(a => a.id === activeAssetId);
                     if (!selectedAsset) {
                       alert("Please select an asset to generate proxies for.");
                       return;
                     }
                     alert(`Proxy generation started for ${selectedAsset.name}... Scaling to 2x for high-fidelity review.`);
                     const res = await fetch('http://localhost:8000/apply', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ action: 'super_scale', file_path: selectedAsset.path })
                     });
                     const data = await res.json();
                     if (data.status === 'success' && data.output_file) {
                        onUpdateAsset(selectedAsset.id, { path: data.output_file });
                        showToast?.(`Proxy generated: ${data.output_file}`, 'success');
                     } else {
                        showToast?.(data.message || "Proxy generation failed.", 'error');
                     }
                   }}
                   className="w-full py-2 bg-blue-600 rounded text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                 >
                   Generate Proxies
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
});
