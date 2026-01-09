import React from 'react';
import { 
  FileVideo, 
  Save, 
  Settings, 
  HelpCircle, 
  Menu,
  Download,
  Upload
} from 'lucide-react';

interface TopBarProps {
  onSettingsClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSettingsClick }) => {
  return (
    <div className="h-[48px] bg-[#18181b] border-b border-[#2c2c30] flex items-center px-4 justify-between select-none">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[#e4e4e7] font-bold text-lg">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <FileVideo size={20} className="text-white" />
          </div>
          <span>Antigravity</span>
        </div>
        
        <div className="flex items-center gap-1">
          {['File', 'Edit', 'View', 'Window'].map(menu => (
            <button key={menu} 
              onClick={() => alert(`${menu} menu clicked`)}
              className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:bg-[#222226] hover:text-[#e4e4e7] rounded transition-colors"
            >
              {menu}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-icon" title="Import Media" onClick={() => alert("Import Media Clicked")}>
          <Upload size={18} />
        </button>
        <button className="btn-icon" title="Save Project" onClick={() => alert("Save Project Clicked")}>
          <Save size={18} />
        </button>
        <button className="btn-icon" title="Export Project" onClick={() => alert("Export Project Clicked")}>
          <Download size={18} />
        </button>
        <div className="w-[1px] h-6 bg-[#2c2c30] mx-2"></div>
        <button className="btn-icon" title="Settings" onClick={onSettingsClick}>
          <Settings size={18} />
        </button>
        <button className="btn-icon" title="Help" onClick={() => alert("Help Clicked")}>
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
};
