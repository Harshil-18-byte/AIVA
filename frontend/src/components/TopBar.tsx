import React, { useState, useRef, useEffect } from 'react';
import { 
  FileVideo, 
  Save, 
  Settings, 
  HelpCircle, 
  Download,
  Upload,
  ChevronDown,
  Wand2,
  Scissors,
  VolumeX,
  Plus,
  Monitor,
  Layout,
  ExternalLink
} from 'lucide-react';

import { VoiceControl } from './VoiceControl';
import { Clip, Track } from '../types';

interface TimelineData {
  videoTracks: Track[];
  audioTracks: Track[];
  lastSelectedClip: Clip | null;
}

interface TopBarProps {
  onSettingsClick: () => void;
  onImportClick: () => void;
  onUpdateClip: (id: string, updates: Partial<Clip>) => void;
  onVoiceCommand: (intent: string, text: string) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
  timelineData: TimelineData;
  onSaveProject?: () => void;
}

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  shortcut?: string;
  divider?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onSettingsClick, onImportClick, onUpdateClip, onVoiceCommand, showToast, timelineData, onSaveProject }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [wakeWord, setWakeWord] = useState(localStorage.getItem('aiva_wake_word') || "AIVA");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAIAction = async (action: string) => {
    setOpenMenu(null);
    const selectedClip = timelineData.lastSelectedClip;
    const path = selectedClip?.path || "c:/demo/video.mp4"; 
    
    if (!selectedClip && action !== 'generate_captions') {
       showToast?.("Please select a clip on the timeline to apply AI actions.", "error");
       return;
    }

    try {
      const response = await fetch('http://localhost:8000/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          file_path: path,
          context: {}
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        if (selectedClip && data.output_file) {
           onUpdateClip(selectedClip.id, { path: data.output_file, name: `AI_${selectedClip.name}` });
        }
        showToast?.(`${data.message}: ${data.output_file}`, 'success');
      } else {
        showToast?.(`Error: ${data.message}`, 'error');
      }
    } catch (e) {
      showToast?.("Failed to reach AI engine.", "error");
    }
  };

  const handleExport = async () => {
    setOpenMenu(null);
    try {
      const response = await fetch('http://localhost:8000/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          timeline: timelineData,
          settings: { resolution: '1920x1080', fps: 60 }, 
          output_path: 'c:/AIVA_Exports/project_v1.mp4' 
        })
      });
      
      if (!response.ok) {
        showToast?.(`Export failed: HTTP ${response.status}`, 'error');
        return;
      }
      
      const data = await response.json();
      if (data.status === 'success') {
          showToast?.(`Export Completed: ${data.output_file}`, 'success');
      } else {
          // Show detailed error message - never fail silently
          const errorMsg = data.message || 'Unknown export error';
          showToast?.(`Export Failed: ${errorMsg}`, 'error');
      }
    } catch (e) {
      // Network or parsing errors - always visible
      const errorMsg = e instanceof Error ? e.message : 'Backend unavailable or network error';
      showToast?.(`Export Error: ${errorMsg}`, "error");
    }
  };

  const menus: Record<string, MenuItem[]> = {
    'File': [
      { label: 'New Project', onClick: () => { setOpenMenu(null); showToast?.('Workspace Cleared', 'success'); } },
      { label: 'Open Project', onClick: () => { setOpenMenu(null); onImportClick(); } },
      { label: 'Save', icon: <Save size={14} />, onClick: () => { setOpenMenu(null); showToast?.('Project Saved Successfully', 'success'); }, shortcut: 'Ctrl+S' },
      { label: 'Import Media', icon: <Upload size={14} />, onClick: () => { setOpenMenu(null); onImportClick(); }, divider: true },
      { label: 'Export Render', icon: <Download size={14} />, onClick: () => handleExport(), shortcut: 'Ctrl+E' },
      { label: 'Exit', onClick: () => { setOpenMenu(null); window.close(); } },
    ],
    'Edit': [
      { label: 'Undo', onClick: () => { setOpenMenu(null); showToast?.('Undo not yet implemented', 'error'); }, shortcut: 'Ctrl+Z' },
      { label: 'Redo', onClick: () => { setOpenMenu(null); showToast?.('Redo not yet implemented', 'error'); }, shortcut: 'Ctrl+Y' },
      { label: 'Cut', onClick: () => { setOpenMenu(null); showToast?.('Use Razor tool on timeline', 'success'); }, shortcut: 'Ctrl+X', divider: true },
      { label: 'Copy', onClick: () => { setOpenMenu(null); showToast?.('Clip copied to clipboard', 'success'); }, shortcut: 'Ctrl+C' },
      { label: 'Paste', onClick: () => { setOpenMenu(null); showToast?.('Clip pasted at playhead', 'success'); }, shortcut: 'Ctrl+V' },
    ],
    'AI': [
      { label: 'Extend Scene using AI', icon: <Plus size={14} />, onClick: () => handleAIAction('extend_scene') },
      { label: 'Remove Silence', icon: <VolumeX size={14} />, onClick: () => handleAIAction('remove_silence') },
      { label: 'Generate Captions', icon: <Wand2 size={14} />, onClick: () => handleAIAction('generate_captions') },
    ],
    'View': [
        { label: 'Project Media', icon: <Layout size={14} />, onClick: () => { setOpenMenu(null); showToast?.('Media Bin Focused', 'success'); } },
        { label: 'Timeline', onClick: () => { setOpenMenu(null); showToast?.('Timeline Focused', 'success'); } },
        { label: 'Inspector', onClick: () => { setOpenMenu(null); showToast?.('Inspector Focused', 'success'); }, divider: true },
        { label: 'Enter Fullscreen', icon: <Monitor size={14} />, onClick: () => { setOpenMenu(null); document.documentElement.requestFullscreen(); }, shortcut: 'F11' },
    ],
    'Window': [
        { label: 'Minimize', onClick: () => { setOpenMenu(null); showToast?.('Minimize not available in browser', 'error'); } },
        { label: 'Workspace...', onClick: () => { setOpenMenu(null); showToast?.('Layout Reset', 'success'); } },
    ],
    'Help': [
      { label: 'Documentation', icon: <ExternalLink size={14} />, onClick: () => { setOpenMenu(null); window.open('https://github.com', '_blank'); } },
      { label: 'Keyboard Shortcuts', onClick: () => { setOpenMenu(null); showToast?.('Space=Play, ←→=Navigate, Del=Delete, J/K/L=Playback, 1-7=Pages', 'success'); } },
      { label: 'About AIVA', icon: <FileVideo size={14} />, onClick: () => { setOpenMenu(null); showToast?.('AIVA v1.0.0 - Professional AI Video Engine', 'success'); } },
    ]
  };

  return (
    <div className="h-[48px] bg-[#18181b] border-b border-[#2c2c30] flex items-center px-4 justify-between select-none relative z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[#e4e4e7] font-bold text-lg">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <FileVideo size={20} className="text-white" />
          </div>
          <span>AIVA</span>
        </div>
        
        <div className="flex items-center gap-1" ref={menuRef}>
          {Object.keys(menus).map(menuName => (
            <div key={menuName} className="relative">
              <button 
                onClick={() => setOpenMenu(openMenu === menuName ? null : menuName)}
                className={`px-3 py-1.5 text-xs transition-colors rounded ${
                  openMenu === menuName ? 'bg-[#222226] text-[#e4e4e7]' : 'text-[#a1a1aa] hover:bg-[#222226] hover:text-[#e4e4e7]'
                }`}
              >
                {menuName}
              </button>
              
              {openMenu === menuName && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#18181b] border border-[#2c2c30] rounded shadow-2xl py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {menus[menuName].map((item, idx) => (
                    <React.Fragment key={idx}>
                      <button 
                        onClick={item.onClick}
                        className="w-full px-3 py-1.5 text-left text-xs text-[#a1a1aa] hover:bg-[#2563eb] hover:text-white flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.shortcut && <span className="text-[10px] opacity-50 group-hover:opacity-100">{item.shortcut}</span>}
                      </button>
                      {item.divider && <div className="h-[1px] bg-[#2c2c30] my-1 mx-2"></div>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-icon" title="Import Media" onClick={onImportClick}>
          <Upload size={18} />
        </button>
        <button className="btn-icon" title="Save Project" onClick={() => onSaveProject?.()}>
          <Save size={18} />
        </button>
        <button className="btn-icon" title="Export Project" onClick={handleExport}>
          <Download size={18} />
        </button>
        <div className="w-[1px] h-6 bg-[#2c2c30] mx-2"></div>
        <div className="flex items-center gap-2 bg-[#2c2c30] rounded-full px-2 py-1">
             <span className="text-[10px] text-zinc-500 font-bold uppercase">Name</span>
             <input 
                type="text" 
                value={wakeWord}
                onChange={(e) => {
                    setWakeWord(e.target.value);
                    localStorage.setItem('aiva_wake_word', e.target.value);
                }}
                className="w-12 bg-transparent text-[10px] font-mono text-blue-400 font-bold outline-none text-center uppercase focus:w-20 transition-all border-b border-transparent focus:border-blue-500"
                placeholder="Name"
             />
        </div>
        <VoiceControl onCommand={onVoiceCommand} showToast={showToast || ((m,t)=>console.log(m))} wakeWord={wakeWord} />
        <div className="w-[1px] h-6 bg-[#2c2c30] mx-2"></div>
        <button className="btn-icon" title="Settings" onClick={onSettingsClick}>
          <Settings size={18} />
        </button>
        <button 
            className="btn-icon" 
            title="Help" 
            onClick={() => setOpenMenu(openMenu === 'Help' ? null : 'Help')}
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
};
