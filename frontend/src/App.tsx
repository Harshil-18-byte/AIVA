import React, { useState } from "react";
import "./index.css";
import { TopBar } from "./components/TopBar";
import { MediaBin } from "./components/MediaBin";
import { PreviewMonitor } from "./components/PreviewMonitor";
import { Inspector } from "./components/Inspector";
import { Timeline } from "./components/Timeline";
import { SettingsModal } from "./components/SettingsModal";

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0f0f11] text-[#e4e4e7] overflow-hidden">
      {/* Top Application Bar */}
      <TopBar onSettingsClick={() => setIsSettingsOpen(true)} />

      {/* Main Workspace Area (Everything except TopBar) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Upper Pane: Media, Preview, Inspector */}
        <div className="flex-1 flex min-h-0">
          <MediaBin />
          
          {/* Resizable Divider would go here */}
          <div className="w-[1px] bg-[#2c2c30]"></div>
          
          <PreviewMonitor />
          
          <div className="w-[1px] bg-[#2c2c30]"></div>
          
          <Inspector />
        </div>

        {/* Horizontal Divider */}
        <div className="h-[1px] bg-[#2c2c30]"></div>

        {/* Lower Pane: Timeline */}
        <Timeline />
      
        {/* Modals Layer */}
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      </div>
    </div>
  );
}
