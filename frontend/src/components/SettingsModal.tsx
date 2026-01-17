import React, { useState } from 'react';
import { X, Monitor, Cpu, Folder, Keyboard, Volume2, Layers } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

// Default Professional Metadata
const DEFAULT_SETTINGS = {
  // General
  language: 'English (United States)',
  theme: '#3b82f6',
  autoSave: true,
  autoSaveInterval: 5,
  loadLastProject: true,
  showTooltips: true,
  hardwareAcceleration: true,
  
  // AI
  aiModel: 'Whisper Small (Recommended)',
  aiStrength: 50,
  detectSilenceThreshold: -40,
  autoGenerateProxies: false,
  aiVoiceIsolation: false,
  aiSceneDetect: true,
  aiGenerativeFill: false,
  
  // Timeline
  defaultDurationStill: 5,
  defaultTransitionDuration: 1,
  timelineScrollMode: 'Smooth',
  snapToGrid: true,
  
  // Storage
  cacheLocation: 'C:\\Users\\AIVA\\Cache',
  proxyFormat: 'ProRes 422 Proxy',
  maxCacheSize: 50, // GB
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, showToast }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<typeof DEFAULT_SETTINGS>(() => {
    const saved = localStorage.getItem('aiva_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        console.error("Failed to parse settings");
      }
    }
    return DEFAULT_SETTINGS;
  });

  const handleSave = () => {
    localStorage.setItem('aiva_settings', JSON.stringify(settings));
    // In a real app, this would also trigger a context update or IPC call
    showToast?.("Configuration Saved Successfully", 'success');
    onClose();
  };

  const updateSetting = (key: keyof typeof DEFAULT_SETTINGS, value: (typeof DEFAULT_SETTINGS)[keyof typeof DEFAULT_SETTINGS]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'timeline', label: 'Timeline', icon: Layers },
    { id: 'ai', label: 'AI Assistance', icon: Cpu },
    { id: 'storage', label: 'Media & Cache', icon: Folder },
    { id: 'audio', label: 'Audio Hardware', icon: Volume2 },
    { id: 'input', label: 'Keyboard Shortcuts', icon: Keyboard },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      {/* Main Modal Panel - Fixed Size 900x700 */}
      <div className="w-[900px] h-[700px] bg-[#0f0f11] rounded-xl border border-[#2c2c30] shadow-2xl flex overflow-hidden">
        
        {/* Left Sidebar - Fixed Width */}
        <div className="w-64 bg-[#18181b] border-r border-[#2c2c30] flex flex-col flex-shrink-0">
          <div className="h-16 flex items-center px-6 border-b border-[#2c2c30]">
             <span className="text-xs font-bold text-[#52525b] uppercase tracking-wider">
              System Preferences
            </span>
          </div>
          
          <div className="flex-1 p-2 space-y-1 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-medium border border-[#3b82f6]/20' 
                    : 'text-[#a1a1aa] hover:bg-[#222226] hover:text-[#e4e4e7]'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-[#2c2c30] text-[10px] text-[#52525b] text-center">
            v1.0.0 (Build 2026.1)
          </div>
        </div>

        {/* Right Content Area - Flex Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f11]">
          
          {/* Header - Fixed Height */}
          <div className="h-16 border-b border-[#2c2c30] flex items-center justify-between px-8 bg-[#18181b] flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-[#e4e4e7]">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">Configure global application behavior</p>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#222226] transition-colors"
              title="Close Settings"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Scrollable Body - Expands to fill available space */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'general' && (
              <div className="space-y-8 max-w-2xl">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">User Interface</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#e4e4e7]">Language</label>
                      <select 
                        value={settings.language}
                        onChange={(e) => updateSetting('language', e.target.value)}
                        className="w-full bg-[#18181b] border border-[#2c2c30] rounded p-2.5 text-sm text-[#e4e4e7] focus:border-[#3b82f6] outline-none"
                      >
                        <option>English (United States)</option>
                        <option>English (UK)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Japanese</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-[#e4e4e7]">Accent Color</label>
                       <div className="flex gap-3">
                        {['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'].map(color => (
                           <button 
                             key={color}
                             onClick={() => updateSetting('theme', color)}
                             className={`w-8 h-8 rounded-full border-2 transition-transform ${settings.theme === color ? 'border-white scale-110' : 'border-[#2c2c30]'}`}
                             style={{ backgroundColor: color }}
                           />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-[#2c2c30]/50">
                    <div>
                      <span className="text-sm text-[#e4e4e7] block">Show Tooltips</span>
                      <span className="text-xs text-[#a1a1aa]">Display helper text when hovering UI elements</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.showTooltips}
                      onChange={(e) => updateSetting('showTooltips', e.target.checked)}
                      className="accent-[#3b82f6] w-4 h-4" 
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Project Handling</h3>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-sm text-[#e4e4e7] block">Load Last Project on Startup</span>
                      <span className="text-xs text-[#a1a1aa]">Automatically resume where you left off</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.loadLastProject}
                      onChange={(e) => updateSetting('loadLastProject', e.target.checked)}
                      className="accent-[#3b82f6]" 
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                     <div>
                      <span className="text-sm text-[#e4e4e7] block">Enable Auto-Save</span>
                      <span className="text-xs text-[#a1a1aa]">Save project file automatically in background</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.autoSave}
                      onChange={(e) => updateSetting('autoSave', e.target.checked)}
                      className="accent-[#3b82f6]" 
                    />
                  </div>

                  {settings.autoSave && (
                    <div className="space-y-2 pl-4 border-l-2 border-[#2c2c30]">
                       <label className="text-sm font-medium text-[#e4e4e7]">Auto-Save Interval (Minutes)</label>
                       <div className="flex items-center gap-4">
                         <input 
                           type="range" 
                           min="1" 
                           max="60" 
                           value={settings.autoSaveInterval}
                           onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value))}
                           className="flex-1 accent-[#3b82f6] h-1 bg-[#2c2c30] rounded-lg appearance-none cursor-pointer" 
                         />
                         <span className="text-sm text-mono w-12 text-right">{settings.autoSaveInterval}m</span>
                       </div>
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                   <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Performance</h3>
                   <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-sm text-[#e4e4e7] block">Hardware Acceleration</span>
                      <span className="text-xs text-[#a1a1aa]">Use GPU for UI rendering and video decoding</span>
                    </div>
                    <input 
                       type="checkbox" 
                       checked={settings.hardwareAcceleration}
                       onChange={(e) => updateSetting('hardwareAcceleration', e.target.checked)}
                       className="accent-[#3b82f6]" 
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'timeline' && (
               <div className="space-y-8 max-w-2xl">
                 <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Editing Behavior</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                        <label className="text-sm font-medium text-[#e4e4e7]">Default Still Duration</label>
                        <div className="flex items-center gap-2">
                           <input 
                             type="number" 
                             value={settings.defaultDurationStill}
                             onChange={(e) => updateSetting('defaultDurationStill', parseInt(e.target.value))}
                             className="w-20 bg-[#18181b] border border-[#2c2c30] rounded p-2 text-sm"
                           />
                           <span className="text-sm text-[#a1a1aa]">seconds</span>
                        </div>
                       </div>
                       
                       <div className="space-y-2">
                        <label className="text-sm font-medium text-[#e4e4e7]">Transition Duration</label>
                        <div className="flex items-center gap-2">
                           <input 
                             type="number" 
                             value={settings.defaultTransitionDuration}
                             onChange={(e) => updateSetting('defaultTransitionDuration', parseFloat(e.target.value))}
                             className="w-20 bg-[#18181b] border border-[#2c2c30] rounded p-2 text-sm"
                           />
                           <span className="text-sm text-[#a1a1aa]">seconds</span>
                        </div>
                       </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-medium text-[#e4e4e7]">Scroll Mode</label>
                      <select 
                         value={settings.timelineScrollMode}
                         onChange={(e) => updateSetting('timelineScrollMode', e.target.value)}
                         className="w-full bg-[#18181b] border border-[#2c2c30] rounded p-2.5 text-sm text-[#e4e4e7]"
                      >
                         <option>Page Scroll</option>
                         <option>Smooth</option>
                         <option>Fixed Playhead</option>
                      </select>
                    </div>

                     <div className="flex items-center justify-between py-3">
                      <div>
                        <span className="text-sm text-[#e4e4e7] block">Snap to Grid</span>
                        <span className="text-xs text-[#a1a1aa]">Magnetic clip alignment</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.snapToGrid}
                        onChange={(e) => updateSetting('snapToGrid', e.target.checked)}
                        className="accent-[#3b82f6]" 
                      />
                    </div>
                 </section>
               </div>
            )}
            
            {/* ... Other tabs would follow similar expanded patterns ... */}
            {/* Adding AI Tab to ensure scrolling capability is demonstrated */}
            
            {activeTab === 'ai' && (
               <div className="space-y-8 max-w-2xl">
                 <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 items-start">
                    <Cpu className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="text-blue-400 text-sm font-bold mb-1">Local Processing Engine</h3>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">
                        AIVA uses local AI models (Whisper, FFmpeg) to process media. This ensures privacy but requires system resources. 
                        Performance depends on your CPU/GPU capabilities.
                      </p>
                    </div>
                 </div>

                 <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Transcription (Whisper)</h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#e4e4e7]">Model Size</label>
                       <select 
                          value={settings.aiModel}
                          onChange={(e) => updateSetting('aiModel', e.target.value)}
                          className="w-full bg-[#18181b] border border-[#2c2c30] rounded p-2.5 text-sm text-[#e4e4e7]"
                       >
                        <option>Whisper Tiny (Fastest, Lower Accuracy)</option>
                        <option>Whisper Base (Balanced)</option>
                        <option>Whisper Small (Recommended)</option>
                        <option>Whisper Medium (High Accuracy, Slower)</option>
                        <option>Whisper Large (Best Accuracy, Slowest)</option>
                      </select>
                      <p className="text-[10px] text-[#52525b]">Larger models require more RAM and VRAM.</p>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Silence Detection</h3>
                     <div className="space-y-2">
                       <div className="flex justify-between">
                          <label className="text-sm font-medium text-[#e4e4e7]">Decibel Threshold</label>
                          <span className="text-xs text-[#a1a1aa]">{settings.detectSilenceThreshold} dB</span>
                       </div>
                       <input 
                         type="range"
                         min="-60"
                         max="-10" 
                         value={settings.detectSilenceThreshold}
                         onChange={(e) => updateSetting('detectSilenceThreshold', parseInt(e.target.value))}
                         className="w-full accent-[#3b82f6] h-1 bg-[#2c2c30] rounded-lg appearance-none cursor-pointer" 
                       />
                       <div className="flex justify-between text-[10px] text-[#52525b]">
                         <span>Sensitive (-60dB)</span>
                         <span>Aggressive (-10dB)</span>
                       </div>
                     </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Generative & Enhancement</h3>
                     
                     <div className="flex items-center justify-between py-3">
                      <div>
                        <span className="text-sm text-[#e4e4e7] block">AI Voice Isolation</span>
                        <span className="text-xs text-[#a1a1aa]">Remove background noise from spoken audio</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.aiVoiceIsolation}
                        onChange={(e) => updateSetting('aiVoiceIsolation', e.target.checked)}
                        className="accent-[#3b82f6]" 
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <span className="text-sm text-[#e4e4e7] block">Smart Scene Detection</span>
                        <span className="text-xs text-[#a1a1aa]">Automatically cut clips at scene changes</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.aiSceneDetect}
                        onChange={(e) => updateSetting('aiSceneDetect', e.target.checked)}
                        className="accent-[#3b82f6]" 
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <span className="text-sm text-[#e4e4e7] block">Generative Fill (Beta)</span>
                        <span className="text-xs text-[#a1a1aa]">Expand images to fill aspect ratio</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.aiGenerativeFill}
                        onChange={(e) => updateSetting('aiGenerativeFill', e.target.checked)}
                        className="accent-[#3b82f6]" 
                      />
                    </div>
                 </section>
               </div>
            )}
            
            {activeTab === 'storage' && (
              <div className="space-y-8 max-w-2xl">
                 <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Disk Cache</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#e4e4e7]">Cache Location</label>
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={settings.cacheLocation} 
                            onChange={(e) => updateSetting('cacheLocation', e.target.value)}
                            className="flex-1 bg-[#18181b] border border-[#2c2c30] rounded p-2 text-sm text-[#e4e4e7] font-mono" 
                          />
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch('http://127.0.0.1:8000/system/browse_folder');
                                const data = await res.json();
                                if (data.status === 'success' && data.path) {
                                  updateSetting('cacheLocation', data.path);
                                }
                              } catch {
                                alert("Failed to open folder picker. Ensure backend is running.");
                              }
                            }}
                            className="px-3 py-2 bg-[#2c2c30] text-[#e4e4e7] rounded text-sm hover:bg-[#3b3b40] transition-colors"
                          >
                            Browse
                          </button>
                      </div>
                      <p className="text-[10px] text-[#52525b]">Fast SSD storage is recommended for optimal playback.</p>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between">
                          <label className="text-sm font-medium text-[#e4e4e7]">Max Import Cache Size</label>
                          <span className="text-xs text-[#a1a1aa]">{settings.maxCacheSize} GB</span>
                       </div>
                       <input 
                         type="range"
                         min="5"
                         max="200"
                         value={settings.maxCacheSize}
                         onChange={(e) => updateSetting('maxCacheSize', parseInt(e.target.value))}
                         className="w-full accent-[#3b82f6] h-1 bg-[#2c2c30] rounded-lg appearance-none cursor-pointer" 
                       />
                   </div>

                   <div className="pt-2">
                     <button 
                       onClick={async () => {
                         try {
                           const res = await fetch('http://127.0.0.1:8000/system/clean_cache', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ cache_path: settings.cacheLocation })
                           });
                           const data = await res.json();
                           if (data.status === 'success') {
                             showToast?.(data.message, 'success');
                           } else {
                             showToast?.(data.message, 'error');
                           }
                         } catch {
                           showToast?.("Failed to clean cache", 'error');
                         }
                       }}
                       className="text-xs text-red-400 hover:text-white border border-red-900/50 bg-red-950/30 px-4 py-2 rounded transition-colors flex items-center gap-2"
                     >
                       <Folder size={14} />
                       Clean Unused Cache Files
                     </button>
                   </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Optimized Media</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#e4e4e7]">Proxy Format</label>
                      <select 
                         value={settings.proxyFormat}
                         onChange={(e) => updateSetting('proxyFormat', e.target.value)}
                         className="w-full bg-[#18181b] border border-[#2c2c30] rounded p-2.5 text-sm text-[#e4e4e7]"
                      >
                        <option>ProRes 422 Proxy (Recommended)</option>
                        <option>ProRes 422 LT</option>
                        <option>H.264 High Performance (8-bit)</option>
                        <option>DNxHR LB (1/4 Resolution)</option>
                      </select>
                   </div>
                   
                   <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-sm text-[#e4e4e7] block">Auto-Generate Proxies</span>
                      <span className="text-xs text-[#a1a1aa]">Create proxies for 4K+ media on import</span>
                    </div>
                    <input 
                       type="checkbox" 
                       checked={settings.autoGenerateProxies}
                       onChange={(e) => updateSetting('autoGenerateProxies', e.target.checked)}
                       className="accent-[#3b82f6]" 
                    />
                  </div>
                 </section>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-8 max-w-2xl">
                 <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Hardware I/O</h3>
                    
                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-2">
                        <label className="text-sm font-medium text-[#e4e4e7]">Default Input</label>
                        <select className="w-full bg-[#18181b] border border-[#2c2c30] rounded p-2.5 text-sm text-[#e4e4e7]">
                           <option>System Default (Microphone Array)</option>
                           <option>Microphone (Realtek(R) Audio)</option>
                           <option>No Input</option>
                        </select>
                       </div>

                       <div className="space-y-2">
                        <label className="text-sm font-medium text-[#e4e4e7]">Default Output</label>
                        <select className="w-full bg-[#18181b] border border-[#2c2c30] rounded p-2.5 text-sm text-[#e4e4e7]">
                           <option>System Default (Speakers)</option>
                           <option>Headphones (Realtek(R) Audio)</option>
                           <option>HDMI Output</option>
                        </select>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-sm font-bold text-[#3b82f6] uppercase tracking-wide border-b border-[#2c2c30] pb-2">Processing</h3>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                        <label className="text-sm font-medium text-[#e4e4e7]">Master Sample Rate</label>
                        <select className="w-full bg-[#18181b] border border-[#2c2c30] rounded p-2.5 text-sm text-[#e4e4e7]">
                           <option>44100 Hz</option>
                           <option>48000 Hz (Video Standard)</option>
                           <option>96000 Hz</option>
                        </select>
                       </div>

                       <div className="space-y-2">
                        <label className="text-sm font-medium text-[#e4e4e7]">Buffer Size</label>
                        <select className="w-full bg-[#18181b] border border-[#2c2c30] rounded p-2.5 text-sm text-[#e4e4e7]">
                           <option>128 Samples (Low Latency)</option>
                           <option>256 Samples</option>
                           <option>512 Samples (Stable)</option>
                           <option>1024 Samples</option>
                        </select>
                       </div>
                    </div>
                 </section>
              </div>
            )}

            {activeTab === 'input' && (
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <input 
                      type="text" 
                      placeholder="Search commands..." 
                      className="flex-1 bg-[#18181b] border border-[#2c2c30] rounded p-2 text-sm text-[#e4e4e7]"
                    />
                    <select className="bg-[#18181b] border border-[#2c2c30] rounded p-2 text-sm text-[#e4e4e7]">
                       <option>All Commands</option>
                       <option>Application</option>
                       <option>Timeline</option>
                       <option>Tools</option>
                    </select>
                 </div>

                 <div className="border border-[#2c2c30] rounded-lg overflow-hidden flex-1 bg-[#18181b]/50">
                    <div className="grid grid-cols-12 bg-[#222226] p-2 text-xs font-bold text-[#a1a1aa] border-b border-[#2c2c30]">
                       <div className="col-span-8 px-2">Command</div>
                       <div className="col-span-4 px-2">Key Binding</div>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                       {[
                         { id: 'save', active: true, cmd: 'Save Project', key: 'Ctrl + S' },
                         { id: 'import', active: true, cmd: 'Import Media', key: 'Ctrl + I' },
                         { id: 'undo', active: true, cmd: 'Undo', key: 'Ctrl + Z' },
                         { id: 'redo', active: true, cmd: 'Redo', key: 'Ctrl + Shift + Z' },
                         { id: 'cut', active: true, cmd: 'Razor Tool', key: 'C' },
                         { id: 'sel', active: true, cmd: 'Selection Tool', key: 'V' },
                         { id: 'play', active: true, cmd: 'Play / Pause', key: 'Space' },
                         { id: 'full', active: true, cmd: 'Toggle Fullscreen', key: 'F11' },
                         { id: 'exp', active: true, cmd: 'Export Media', key: 'Ctrl + M' },
                         { id: 'pref', active: true, cmd: 'Preferences', key: 'Ctrl + ,' },
                       ].map((shortcut, i) => (
                         <div key={shortcut.id} className={`grid grid-cols-12 p-3 text-sm border-b border-[#2c2c30] items-center hover:bg-[#222226] transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-[#0f0f11]'}`}>
                           <div className="col-span-8 px-2 text-[#e4e4e7]">{shortcut.cmd}</div>
                           <div className="col-span-4 px-2">
                              <button className="px-2 py-1 bg-[#2c2c30] rounded border border-[#3f3f46] text-xs font-mono text-[#e4e4e7] hover:border-[#3b82f6] min-w-[80px]">
                                {shortcut.key}
                              </button>
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

          </div>
          
          {/* Footer Persistence */}
          <div className="h-20 border-t border-[#2c2c30] flex items-center justify-end px-8 gap-4 bg-[#18181b] flex-shrink-0">
             <button 
               onClick={onClose} 
               className="px-6 py-2.5 text-sm text-[#e4e4e7] hover:bg-[#2c2c30] rounded-md transition-colors font-medium"
             >
               Cancel
             </button>
             <button 
               onClick={handleSave} 
               className="px-6 py-2.5 text-sm bg-[#3b82f6] text-white font-medium rounded-md hover:bg-[#2563eb] transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
             >
               <Save size={16} />
               Save Configuration
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for Save Icon since it wasn't imported
import { Save } from 'lucide-react';