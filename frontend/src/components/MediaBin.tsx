import React, { useState } from 'react';
import { Folder, Film, Music, Image as ImageIcon, Search, Grip, List } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration?: string;
  resolution?: string;
}

const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'interview_A_roll.mp4', type: 'video', duration: '04:23', resolution: '4K' },
  { id: '2', name: 'background_music_01.wav', type: 'audio', duration: '02:30' },
  { id: '3', name: 'b_roll_city.mp4', type: 'video', duration: '00:45', resolution: '1080p' },
  { id: '4', name: 'logo_transparent.png', type: 'image', resolution: '1000x1000' },
];

export const MediaBin: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="panel flex-1 h-full min-w-[250px]">
      <div className="panel-header justify-between">
        <span>Project Media</span>
        <div className="flex gap-1">
          <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'text-white bg-[#2c2c30]' : ''}`}>
            <Grip size={14} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'text-white bg-[#2c2c30]' : ''}`}>
            <List size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-2 border-b border-[#2c2c30]">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-2 text-[#52525b]" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full pl-7 bg-[#0a0a0c] border border-[#2c2c30] rounded p-1 text-xs text-[#e4e4e7]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {MOCK_ASSETS.map(asset => (
              <div key={asset.id} className="group flex flex-col gap-1 p-2 rounded hover:bg-[#222226] cursor-pointer">
                <div className="aspect-video bg-[#0a0a0c] rounded border border-[#2c2c30] flex items-center justify-center relative overflow-hidden">
                  {asset.type === 'video' && <Film className="text-[#52525b]" />}
                  {asset.type === 'audio' && <Music className="text-[#52525b]" />}
                  {asset.type === 'image' && <ImageIcon className="text-[#52525b]" />}
                  <div className="absolute bottom-1 right-1 px-1 bg-black/80 rounded text-[10px] text-white font-mono">
                    {asset.duration || asset.resolution}
                  </div>
                </div>
                <span className="text-xs text-[#a1a1aa] truncate group-hover:text-white">{asset.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {MOCK_ASSETS.map(asset => (
              <div key={asset.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-[#222226] cursor-pointer">
                {asset.type === 'video' && <Film size={14} className="text-[#52525b]" />}
                {asset.type === 'audio' && <Music size={14} className="text-[#52525b]" />}
                {asset.type === 'image' && <ImageIcon size={14} className="text-[#52525b]" />}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-[#e4e4e7] truncate">{asset.name}</span>
                  <span className="text-[10px] text-[#52525b] font-mono">{asset.duration || asset.resolution}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
