import React, { useState, useEffect } from "react";
import "./index.css";
import { TopBar } from "./components/TopBar";
import { MediaBin } from "./components/MediaBin";
import { PreviewMonitor } from "./components/PreviewMonitor";
import { Inspector } from "./components/Inspector";
import { Timeline } from "./components/Timeline";
import { Waveform } from "./components/Waveform";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { SettingsModal } from "./components/SettingsModal";
import { AIStatusPanel, AIJob } from "./components/AIStatusPanel";

import { Asset, Clip, Track } from "./types";

export default function App() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playheadPos, setPlayheadPos] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [markers, setMarkers] = useState<number[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  const addMarkers = (newMarkers: number[]) => {
    setMarkers(prev => [...new Set([...prev, ...newMarkers])]);
  };

  const [activePage, setActivePage] = useState<
    "media" | "cut" | "edit" | "fusion" | "color" | "audio" | "deliver" | "ai_hub"
  >("edit");
  const [exportPreset, setExportPreset] = useState("Custom");

  const [assets, setAssets] = useState<Asset[]>([]);

  const [videoTracks, setVideoTracks] = useState<Track[]>([
    { id: "v1", clips: [] },
  ]);
  const [audioTracks, setAudioTracks] = useState<Track[]>([
    { id: "a1", clips: [] },
  ]);

  // Derived Project Duration
  const calculateTotalDuration = () => {
    const maxClipEnd = Math.max(
      ...videoTracks.flatMap(t => t.clips.map(c => c.start + c.width)),
      ...audioTracks.flatMap(t => t.clips.map(c => c.start + c.width)),
      0
    );
    // Convert 100px/s to seconds, minimum 60s
    return Math.max(60, maxClipEnd / 100); 
  };
  const projectDuration = calculateTotalDuration();
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ id?: string, title: string, description: string, action: string }[]>([]);
  
  // Frame-accurate playhead update using video element as master clock
  useEffect(() => {
    let animationFrameId: number;
    
    const updateLoop = () => {
      if (isPlaying) {
         // If video is driving, we sync playhead to it
         if (videoRef.current && !videoRef.current.paused) {
             const currentTime = videoRef.current.currentTime;
             // 100 pixels per second is our scale
             setPlayheadPos(currentTime * 100);
         } else {
             // Fallback if no video is active (e.g. playing timeline with no clips)
             setPlayheadPos(prev => prev + (100 / 60)); // ~60fps advancement
         }
         animationFrameId = requestAnimationFrame(updateLoop);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateLoop);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const clip = getSelectedClip();
      if (!clip) {
        setSuggestions([]);
        return;
      }
      try {
        const resp = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_path: clip.path }),
        });
        const data = await resp.json();
        setSuggestions(data.suggestions || []);
      } catch (e) {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [selectedClipId, selectedAssetId]);

  const addVideoTrack = () => {
    setVideoTracks((prev) => [
      ...prev,
      { id: `v${prev.length + 1}`, clips: [] },
    ]);
  };

  const addAudioTrack = () => {
    setAudioTracks((prev) => [
      ...prev,
      { id: `a${prev.length + 1}`, clips: [] },
    ]);
  };

  const updateClip = (clipId: string, updates: Partial<Clip>) => {
    setVideoTracks((prev) =>
      prev.map((t) => ({
        ...t,
        clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
      }))
    );
    setAudioTracks((prev) =>
      prev.map((t) => ({
        ...t,
        clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
      }))
    );
  };

  const updateAsset = (assetId: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, ...updates } : a));
  };

  const deleteAsset = (assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    if (selectedAssetId === assetId) setSelectedAssetId(null);
    showToast("Media deleted from bin");
  };

  const getSelectedClip = () => {
    if (selectedClipId) {
      let found: Clip | undefined = undefined;
      // Search video tracks
      videoTracks.forEach((t) => {
        const c = t.clips.find((clip) => clip.id === selectedClipId);
        if (c) found = c;
      });
      if (found) return found;
      // Search audio tracks
      audioTracks.forEach((t) => {
        const c = t.clips.find((clip) => clip.id === selectedClipId);
        if (c) found = c;
      });
      return found || null;
    }
    if (selectedAssetId) {
      const asset = assets.find((a) => a.id === selectedAssetId);
      if (asset) return { ...asset, start: 0, width: 200, color: "blue" }; // Fake clip for preview
    }
    return null;
  };

  const [aiJobs, setAiJobs] = useState<AIJob[]>([]);

  const addAIJob = (job: AIJob) => {
      setAiJobs(prev => [job, ...prev]);
  };

  const updateAIJob = (id: string, updates: Partial<AIJob>) => {
      setAiJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
  };

  const handleSaveProject = async () => {
      try {
          const res = await fetch('http://localhost:8000/system/browse_save_file');
          const data = await res.json();
          if (data.status === 'success' && data.path) {
              const projectData = {
                  assets,
                  videoTracks,
                  audioTracks,
                  markers,
                  version: '1.0'
              };
              const saveRes = await fetch('http://localhost:8000/project/save', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ path: data.path, data: projectData })
              });
              const saveData = await saveRes.json();
              showToast(saveData.status === 'success' ? "Project Saved Successfully" : "Save Failed", saveData.status === 'success' ? 'success' : 'error');
          }
      } catch (e) { showToast("Save Error", "error"); }
  };



  const getActiveClipAtPlayhead = () => {
    // Top-down search for visible VIDEO content
    // We explicitly skip 'transition' clips so they don't block the underlying video preview
    for (let i = videoTracks.length - 1; i >= 0; i--) {
      // Find all clips at playhead
      const clipsAtHead = videoTracks[i].clips.filter(
        (c) => playheadPos >= c.start && playheadPos <= c.start + c.width
      );
      
      if (clipsAtHead.length > 0) {
          // If there's a transition AND a video, prefer the video
          // Or if there's just a transition, keep looking down? 
          // Usually transitions are on top of cuts. 
          // For now: find the first non-transition clip at this playhead position
          const videoClip = clipsAtHead.find(c => c.type !== 'transition');
          if (videoClip) return videoClip;
      }
    }
    return null;
  };

  const handleSplit = async (pos: number) => {
    let targetClip: Clip | null = null;
    
    // We need to use state setter callback logic or current state if we are inside a function
    // Since this is defined in App, we use the current state 'videoTracks' / 'audioTracks'
    
    const nextVideoTracks = videoTracks.map(track => {
      const clipIndex = track.clips.findIndex(c => pos > c.start && pos < (c.start + c.width));
      if (clipIndex === -1) return track;
      const clip = track.clips[clipIndex];
      targetClip = clip;
      const part1Id = `${clip.id}_p1`;
      const newClips = [...track.clips];
      newClips.splice(clipIndex, 1, 
        { ...clip, id: part1Id, width: pos - clip.start },
        { ...clip, id: `${clip.id}_p2`, start: pos, width: clip.width - (pos - clip.start) }
      );
      setSelectedClipId(part1Id);
      return { ...track, clips: newClips };
    });

    const nextAudioTracks = audioTracks.map(track => {
      const clipIndex = track.clips.findIndex(c => pos > c.start && pos < (c.start + c.width));
      if (clipIndex === -1) return track;
      const clip = track.clips[clipIndex];
      // If we already set targetClip from video, we might technically split audio too.
      // Prioritize video split for API call if both, or just first one found.
      if (!targetClip) targetClip = clip;
      const part1Id = `${clip.id}_p1`;
      const newClips = [...track.clips];
      newClips.splice(clipIndex, 1, 
        { ...clip, id: part1Id, width: pos - clip.start },
        { ...clip, id: `${clip.id}_p2`, start: pos, width: clip.width - (pos - clip.start) }
      );
      setSelectedClipId(part1Id);
      return { ...track, clips: newClips };
    });

    setVideoTracks(nextVideoTracks);
    setAudioTracks(nextAudioTracks);

    if (targetClip) {
      try {
        // We do not need to call backend for a simple cut in UI unless it's a "smart cut"
        // But for consistency with previous code:
        await fetch('http://localhost:8000/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cut_clip', file_path: (targetClip as Clip).path, params: { timestamp: pos / 100 } })
        });
      } catch (e) {}
    }
  };

  const handleVoiceCommand = async (intent: string, text: string) => {
    if (intent === 'PLAY') setIsPlaying(true);
    if (intent === 'PAUSE') setIsPlaying(false);
    
    if (intent === 'CUT') {
        handleSplit(playheadPos);
        showToast("Cut command executed");
    }
    
    if (intent === 'REMOVE_SILENCE') {
         const clip = getSelectedClip() || getActiveClipAtPlayhead();
         if (clip) {
             const jobId = `job-${Date.now()}`;
             showToast("Removing silence...", "success");
             addAIJob({
                 id: jobId,
                 type: 'remove_silence', // Must match AIJob type
                 status: 'processing',
                 date: Date.now(),
                 name: `Silence Removal: ${clip.name}`
             });

             // Call apply endpoint
             fetch('http://localhost:8000/apply', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'remove_silence', file_path: clip.path })
             }).then(res => res.json()).then(data => {
                if (data.status === 'success') {
                   // Ideally we replace the clip in timeline with new file?
                   // The backend returns output_file? Not explicitly in the old code block, check api.py
                   // api.py apply() returns: { status: 'success', output_file: ... }
                   if (data.output_file) {
                       const updateTracks = (prev: Track[]) => prev.map(t => ({...t, clips: t.clips.map((c) => c.id === clip.id ? {...c, path: data.output_file, name: `Cut_${c.name}`} : c)})); 
                       setVideoTracks(updateTracks); 
                       setAudioTracks(updateTracks);
                   }
                   updateAIJob(jobId, { status: 'completed', result: data.output_file });
                   showToast("Silence removed", "success");
                } else {
                   updateAIJob(jobId, { status: 'failed' });
                   showToast("Silence removal failed", "error");
                }
             }).catch(e => {
                updateAIJob(jobId, { status: 'failed' });
                showToast("Silence removal error", "error");
             });
         } else {
             showToast("No clip selected for silence removal", "error");
         }
    }

    if (intent === 'ADD_TRANSITION') {
        const transName = text.toLowerCase().includes('wipe') ? (text.includes('left') ? 'Wipe Left' : 'Wipe Right') : 'Cross Dissolve';
        const transPath = text.toLowerCase().includes('wipe') ? (text.includes('left') ? 'builtin://wipe-left' : 'builtin://wipe-right') : 'builtin://cross-dissolve';
        
        let added = false;
        // Add transition to V1 track centered at playhead
        setVideoTracks(prev => prev.map(t => {
            if (t.id !== 'v1') return t;
            
            // Basic proximity check
            const nearClips = t.clips.some(c => c.start < (playheadPos + 200) && (c.start + c.width) > (playheadPos - 200));
            if (!nearClips) return t;

            added = true;
            const newClip: Clip = {
                id: `trans-${Date.now()}`,
                name: transName,
                type: 'transition',
                path: transPath,
                start: playheadPos - 20, // Centered (40px width)
                width: 40,
                color: '#9333ea'
            };
            return { ...t, clips: [...t.clips, newClip] };
        }));

        if (added) showToast(`Added ${transName}`, "success");
        else showToast("No clips nearby for transition", "error");
    }

    if (intent === 'ADD_EFFECT') {
        // Add an effect layer
        const effectName = text.toLowerCase().includes('blur') ? 'Blur' : (text.toLowerCase().includes('grain') ? 'Film Grain' : 'Vignette');
        let added = false;
        
        setVideoTracks(prev => prev.map(t => {
            if (t.id !== 'v1') return t;
             // Add effect on top of current clip at playhead
             const newClip: Clip = {
                 id: `fx-${Date.now()}`,
                 name: effectName,
                 type: 'effect',
                 path: `builtin://${effectName.toLowerCase().replace(' ', '-')}`,
                 start: playheadPos,
                 width: 200, // 2 seconds
                 color: '#ec4899'
             };
             added = true;
             return { ...t, clips: [...t.clips, newClip] };
        }));
        if (added) showToast(`Added ${effectName} Effect`, "success");
    }

    if (intent === 'APPLY_SUGGESTION') {
        const numbers = text.match(/\d+/);
        let index = -1;
        if (numbers) {
            index = parseInt(numbers[0]) - 1;
        } else {
            // Text to number fallback
            const words: {[key: string]: number} = { 'one': 0, 'first': 0, 'two': 1, 'second': 1, 'three': 2, 'third': 2, 'four': 3, 'fourth': 3 };
            const found = Object.keys(words).find(w => text.toLowerCase().includes(w));
            if (found !== undefined) index = words[found!];
        }

        if (index >= 0 && index < suggestions.length) {
            const suggestion = suggestions[index];
            const clip = getSelectedClip() || getActiveClipAtPlayhead();
            if (clip) {
                 showToast(`Applying suggestion ${index + 1}: ${suggestion.title}`, "success");
                 const jobId = `job-${Date.now()}`;
                 addAIJob({
                     id: jobId,
                     type: suggestion.action,
                     status: 'processing',
                     date: Date.now(),
                     name: `Applying: ${suggestion.title}`
                 });

                 fetch('http://localhost:8000/apply', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ action: suggestion.action, file_path: clip.path, params: {} })
                 }).then(res => res.json()).then(data => {
                     if (data.status === 'success' && data.output_file) {
                        const updateTracks = (prev: Track[]) => prev.map(t => ({...t, clips: t.clips.map((c) => c.id === clip.id ? {...c, path: data.output_file, name: `AI_${c.name}`} : c)})); 
                        setVideoTracks(updateTracks); 
                        setAudioTracks(updateTracks);
                        updateAIJob(jobId, { status: 'completed', result: data.output_file });
                        showToast(`Applied: ${suggestion.title}`, "success");
                     } else {
                         updateAIJob(jobId, { status: 'failed' });
                         showToast("Failed to apply suggestion", "error");
                     }
                 }).catch(e => { 
                     updateAIJob(jobId, { status: 'failed' });
                     showToast("Error applying suggestion", "error"); 
                 });
            } else {
                 showToast("No clip selected to apply suggestion to", "error");
            }
        } else {
             showToast("Suggestion number not found", "error");
        }
    }

    // --- NEW VOICE COMMANDS IMPLEMENTATION ---
    if (intent === 'COLOR_GRADE') { // "Make it cinematic", "Increase brightness"
        const clip = getSelectedClip() || getActiveClipAtPlayhead();
        if (!clip) return showToast("Select a clip to grade", "error");
        
        const isBright = text.includes('bright') || text.includes('light');
        const isDark = text.includes('dark');
        const isSat = text.includes('saturat') || text.includes('colorful');
        const isCinematic = text.includes('cinematic') || text.includes('movie');

        updateClip(clip.id, {
            ...((isBright) && { gain: { r: 20, g: 20, b: 20 } }), // +20 brightness
            ...((isDark) && { gain: { r: -20, g: -20, b: -20 } }), // -20 brightness
            ...((isSat) && { saturation: 150 }), // Boost sat
            ...((isCinematic) && { contrast: 120, saturation: 80, tint: -10, temperature: -10 }), // Teal/Orange-ish
        });
        showToast(`Color: Applied ${isCinematic ? 'Cinematic Look' : 'Adjustments'}`, "success");
    }

    if (intent === 'DELETE_CLIP') { // "Delete this", "Remove clip"
        const clip = getSelectedClip();
        if (clip) {
            setVideoTracks(prev => prev.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== clip.id) })));
            setAudioTracks(prev => prev.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== clip.id) })));
            setSelectedClipId(null);
            showToast("Clip deleted by voice", "success");
        }
    }

    if (intent === 'SPLIT_CLIP') { // "Cut here", "Split"
        handleSplit(playheadPos);
    }

    if (intent === 'PLAYBACK_CONTROL') { // "Play video", "Stop", "Pause"
        const shouldPlay = text.includes('play') || text.includes('start');
        const shouldPause = text.includes('stop') || text.includes('pause');
        if (shouldPlay) setIsPlaying(true);
        if (shouldPause) setIsPlaying(false);
    }

    if (intent === 'CAPTION') {
         const clip = getSelectedClip() || getActiveClipAtPlayhead();
         if (clip) {
             showToast("Generating captions...", "success");
             // Add job to queue
             const jobId = `job-${Date.now()}`;
             addAIJob({
                 id: jobId,
                 type: 'transcribe',
                 status: 'processing',
                 date: Date.now(),
                 name: `Transcribing ${clip.name}`
             });
             
             // Async call
             fetch('http://localhost:8000/ai/transcribe', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ file_path: clip.path })
             }).then(r => r.json()).then(d => {
                 if(d.status === 'success') {
                     updateAIJob(jobId, { status: 'completed', result: d.transcription });
                     showToast("Captions Ready in AI Hub", "success");
                 } else {
                     updateAIJob(jobId, { status: 'failed' });
                     showToast("Caption generation failed", "error");
                 }
             }).catch(() => {
                 updateAIJob(jobId, { status: 'failed' });
                 showToast("Caption request failed", "error");
             });
         } else {
             showToast("Select a clip to caption", "error");
         }
    }
  };

  const runExport = async () => {
    try {
      const resp = await fetch('http://localhost:8000/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeline: { videoTracks, audioTracks },
          output_path: "c:/AIVA_Exports/Project_V1.mp4"
        })
      });
      const data = await resp.json();
      
      // Properly handle export response - never fail silently
      if (data.status === 'success') {
        showToast(`Export completed: ${data.output_file}`, 'success');
      } else {
        showToast(`Export failed: ${data.message || 'Unknown error'}`, 'error');
      }
    } catch (e) {
      showToast(`Export error: ${e instanceof Error ? e.message : 'Failed to reach render engine'}`, "error");
    }
  };

  const handleImportMedia = async () => {
    try {
      const response = await fetch("http://localhost:8000/system/browse_file");
      const data = await response.json();
      if (data.status === "success" && data.path) {
        // Calculate robust duration placeholder - real app would probe file
        // For now we rely on the player to start playing it
        const newAsset: Asset = {
          id: `asset-${Date.now()}`,
          name: data.path.split(/[\\/]/).pop() || "New Asset",
          type:
            data.path.toLowerCase().endsWith(".mp3") ||
            data.path.toLowerCase().endsWith(".wav")
              ? "audio"
              : "video",
          path: data.path,
          duration: "00:00",
        };
        setAssets((prev) => [...prev, newAsset]);
        
        // Auto-add to timeline if empty (UX improvement)
        const isTimelineEmpty = videoTracks.every(t => t.clips.length === 0) && audioTracks.every(t => t.clips.length === 0);
        if (isTimelineEmpty && newAsset.type === 'video') {
             // We need to know duration to add it correctly, but we can default to a reasonable length
             // or better: let the video element update it later?
             // We'll add it with a default length of 10s (1000px) and let the user resize or let it auto-expand
             const newClip: Clip = {
                 id: `clip-${Date.now()}`,
                 name: newAsset.name,
                 path: newAsset.path,
                 type: 'video',
                 start: 0,
                 width: 3000, // Guess 30s
                 color: 'blue'
             };
             setVideoTracks(prev => prev.map(t => t.id === 'v1' ? { ...t, clips: [newClip] } : t));
             showToast(`Imported & Added to Timeline: ${newAsset.name}`);
        } else {
             showToast(`Imported to Bin: ${newAsset.name}`);
        }
      } else if (data.status === "error") {
        showToast(`Import Error: ${data.message}`, "error");
      }
    } catch (e) {
      showToast("Backend connectivity issue. Is the Python server running?", "error");
      console.error("Failed to import media", e);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Spacebar - Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
        showToast(isPlaying ? "Paused" : "Playing");
      }

      // Arrow Left - Previous Frame (frame-accurate)
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        // Decrement by exactly 1 frame (4 pixels at 25fps)
        setPlayheadPos(prev => {
          const frameIndex = Math.floor(prev / 4);
          const prevFrameIndex = Math.max(0, frameIndex - 1);
          return prevFrameIndex * 4; // Snap to frame boundary
        });
      }

      // Arrow Right - Next Frame (frame-accurate)
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        // Increment by exactly 1 frame (4 pixels at 25fps)
        setPlayheadPos(prev => {
          const frameIndex = Math.floor(prev / 4);
          const nextFrameIndex = frameIndex + 1;
          return nextFrameIndex * 4; // Snap to frame boundary
        });
      }

      // Delete/Backspace - Delete selected clip
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedClipId) {
        e.preventDefault();
        setVideoTracks(prev => prev.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== selectedClipId) })));
        setAudioTracks(prev => prev.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== selectedClipId) })));
        setSelectedClipId(null);
        showToast("Clip deleted");
      }

      // Ctrl/Cmd + I - Import
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyI') {
        e.preventDefault();
        handleImportMedia();
      }

      // Ctrl/Cmd + E - Export
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyE') {
        e.preventDefault();
        runExport();
      }

      // Ctrl/Cmd + S - Save (show toast)
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        showToast("Project auto-saved");
      }

      // Home - Go to start (frame 0)
      if (e.code === 'Home') {
        e.preventDefault();
        setPlayheadPos(0); // Frame 0 = 0 pixels
      }

      // End - Go to end (snap to frame boundary)
      if (e.code === 'End') {
        e.preventDefault();
        // Snap to frame boundary (6000 pixels = 1500 frames)
        const frameIndex = Math.floor(6000 / 4);
        setPlayheadPos(frameIndex * 4);
      }

      // J, K, L - Playback controls (industry standard, frame-accurate)
      if (e.code === 'KeyJ') {
        e.preventDefault();
        // Rewind by 10 frames (40 pixels = 10 frames at 25fps)
        setPlayheadPos(prev => {
          const frameIndex = Math.floor(prev / 4);
          const prevFrameIndex = Math.max(0, frameIndex - 10);
          return prevFrameIndex * 4; // Snap to frame boundary
        });
      }
      if (e.code === 'KeyK') {
        e.preventDefault();
        setIsPlaying(false); // Stop - immediately halts frame advancement
      }
      if (e.code === 'KeyL') {
        e.preventDefault();
        // Fast forward by 10 frames (40 pixels = 10 frames at 25fps)
        setPlayheadPos(prev => {
          const frameIndex = Math.floor(prev / 4);
          const nextFrameIndex = frameIndex + 10;
          return nextFrameIndex * 4; // Snap to frame boundary
        });
      }

      // Number keys 1-7 - Switch pages
      if (e.code === 'Digit1') setActivePage('media');
      if (e.code === 'Digit2') setActivePage('cut');
      if (e.code === 'Digit3') setActivePage('edit');
      if (e.code === 'Digit4') setActivePage('fusion');
      if (e.code === 'Digit5') setActivePage('color');
      if (e.code === 'Digit6') setActivePage('audio');
      if (e.code === 'Digit7') setActivePage('deliver');
      if (e.code === 'Digit8') setActivePage('ai_hub');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, selectedClipId]);


  return (
    <div className="w-screen h-screen flex flex-col bg-[#080809] text-[#e4e4e7] overflow-hidden">
      <TopBar
        onSettingsClick={() => setIsSettingsOpen(true)}
        onImportClick={handleImportMedia}
        onUpdateClip={updateClip}
        showToast={showToast}
        timelineData={{
          videoTracks,
          audioTracks,
          lastSelectedClip: getSelectedClip(),
        }}
        onVoiceCommand={handleVoiceCommand}
        onSaveProject={handleSaveProject}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Main Workspace Router */}
        <div className="flex-1 flex min-h-0">
          {activePage === 'media' && (
            <div className="flex-1 flex animate-in fade-in zoom-in-95 duration-500">
               <MediaBin assets={assets} setSelectedAssetId={setSelectedAssetId} setSelectedClipId={setSelectedClipId} onUpdateAsset={updateAsset} onDeleteAsset={deleteAsset} showToast={showToast} fullView />
            </div>
          )}

          {(activePage === 'edit' || activePage === 'cut' || activePage === 'fusion') && (
            <>
               <MediaBin assets={assets} setSelectedAssetId={setSelectedAssetId} setSelectedClipId={setSelectedClipId} onUpdateAsset={updateAsset} onDeleteAsset={deleteAsset} showToast={showToast} />
               <div className="w-[1px] bg-[#1f1f23]"></div>
               <PreviewMonitor 
                  ref={videoRef} 
                  selectedClip={getSelectedClip() || getActiveClipAtPlayhead()} 
                  playheadPos={playheadPos} 
                  isPlaying={isPlaying} 
                  setIsPlaying={setIsPlaying} 
                  projectDuration={projectDuration} 
                  viewMode={selectedAssetId ? 'source' : 'timeline'}
               />
               <div className="w-[1px] bg-[#1f1f23]"></div>
               <Inspector selectedClip={getSelectedClip()} onUpdateClip={updateClip} onAddMarkers={addMarkers} showToast={showToast} />
            </>
          )}

          {activePage === 'color' && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 bg-black flex items-center justify-center p-8">
                     <PreviewMonitor 
                        ref={videoRef}
                        selectedClip={getSelectedClip() || getActiveClipAtPlayhead()} 
                        playheadPos={playheadPos} 
                        isPlaying={isPlaying} 
                        setIsPlaying={setIsPlaying}
                        hideControls 
                        projectDuration={projectDuration}
                     />
                  </div>
                   <Inspector selectedClip={getSelectedClip()} onUpdateClip={updateClip} onAddMarkers={addMarkers} showToast={showToast} />
               </div>
               {/* Resolve Scopes */}
               <div className="h-64 bg-[#0a0a0c] border-t border-[#1f1f23] flex">
                  <div className="flex-1 p-4 flex flex-col gap-2">
                     <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Waveform</span>
                     <div className="flex-1 flex overflow-hidden">
                        <Waveform videoRef={videoRef} />
                     </div>
                  </div>
                  <div className="w-96 p-4 flex flex-col gap-2 border-l border-[#1f1f23]">
                     <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Parade (RGB)</span>
                     <div className="flex-1 flex gap-2">
                        <div className="flex-1 bg-red-900/10 border border-red-900/20 rounded"></div>
                        <div className="flex-1 bg-green-900/10 border border-green-900/20 rounded"></div>
                        <div className="flex-1 bg-blue-900/10 border border-blue-900/20 rounded"></div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activePage === 'audio' && (
            <div className="flex-1 flex flex-col animate-in fade-in duration-500">
               <div className="h-64 border-b border-[#1f1f23]">
                  <PreviewMonitor 
                     ref={videoRef}
                     selectedClip={getSelectedClip() || getActiveClipAtPlayhead()} 
                     playheadPos={playheadPos} 
                     isPlaying={isPlaying} 
                     setIsPlaying={setIsPlaying}
                     hideControls 
                  />
               </div>
               <div className="flex-1 bg-[#0c0c0e] p-8 flex flex-col gap-4">
                  <div className="h-48 w-full">
                     <AudioVisualizer videoRef={videoRef} width={800} height={200} />
                  </div>
                  <div className="flex gap-4 overflow-x-auto">
                   {[1, 2, 3, 4, 5, 'M'].map(id => (
                      <div key={id} className={`w-16 flex flex-col items-center gap-4 ${id === 'M' ? 'ml-8' : ''}`}>
                         <div className="flex-1 w-2 bg-black rounded-full relative h-32">
                            <div className={`absolute bottom-0 inset-x-0 rounded-full h-1/2 ${id === 'M' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-green-500'}`}></div>
                            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4 h-2 bg-zinc-600 rounded cursor-pointer shadow-xl"></div>
                         </div>
                         <span className="text-[10px] font-black uppercase text-zinc-600">{id === 'M' ? 'Master' : `A${id}`}</span>
                      </div>
                   ))}
                  </div>
               </div>
            </div>
          )}

          {activePage === 'deliver' && (
            <div className="flex-1 bg-black p-20 flex animate-in slide-in-from-right duration-700">
               <div className="w-full max-w-5xl mx-auto flex gap-12">
                  <div className="w-80 space-y-6">
                     <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Render Settings</h3>
                     {['Custom', 'YouTube 4K', 'ProRes HQ', 'TikTok Vertical'].map(p => (
                        <div key={p} className="p-4 bg-[#141417] rounded-xl border border-[#1f1f23] hover:border-blue-500/50 cursor-pointer flex justify-between items-center group transition-all">
                           <span className="text-[11px] font-black uppercase">{p}</span>
                           <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0)] group-hover:shadow-[0_0_10px_rgba(59,130,246,1)] transition-all"></div>
                        </div>
                     ))}
                  </div>
                  <div className="flex-1 space-y-8">
                     <div className="bg-[#141417] p-10 rounded-3xl border border-[#1f1f23] space-y-8">
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Project Name</p>
                              <h2 className="text-3xl font-black">AIVA_MASTER_SEQUENCE</h2>
                           </div>
                           <button onClick={runExport} className="px-10 py-4 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl active:scale-95">Render project</button>
                        </div>
                        <div className="h-px bg-zinc-800"></div>
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-xs text-zinc-400">
                                 <span>Video Format</span>
                                 <span className="text-white">QuickTime / H.264</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-zinc-400">
                                 <span>FPS</span>
                                 <span className="text-white">24.000</span>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-xs text-zinc-400">
                                 <span>Audio Sample Rate</span>
                                 <span className="text-white">48,000 Hz</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-zinc-400">
                                 <span>Encoding</span>
                                 <span className="text-white">Hardware Accelerated</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
          {activePage === 'ai_hub' && (
             <div className="flex-1 flex animate-in fade-in zoom-in-95 duration-500">
                <AIStatusPanel 
                    jobs={aiJobs} 
                    onImportAsset={(path, type) => {
                        const newAsset: Asset = {
                            id: `asset-${Date.now()}`,
                            name: path.split('/').pop() || 'AI Asset',
                            type,
                            path,
                            duration: '00:00' // Default placeholder
                        };
                        setAssets(prev => [...prev, newAsset]); 
                        showToast("Asset Imported", "success");
                    }}
                    onClearJobs={() => setAiJobs([])}
                />
             </div>
           )}
        </div>

        <div className="h-[1px] bg-[#1f1f23]"></div>

        {/* Global Multi-Track Timeline */}
        {['edit', 'cut', 'color', 'audio'].includes(activePage) && (
          <Timeline
            videoTracks={videoTracks}
            setVideoTracks={setVideoTracks}
            audioTracks={audioTracks}
            setAudioTracks={setAudioTracks}
            selectedClipId={selectedClipId}
            setSelectedClipId={setSelectedClipId}
            setSelectedAssetId={setSelectedAssetId}
            playheadPos={playheadPos}
            setPlayheadPos={setPlayheadPos}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            suggestions={suggestions}
            onAddVideoTrack={addVideoTrack}
            onAddAudioTrack={addAudioTrack}
            showToast={showToast}
            markers={markers}
            onSplit={handleSplit}
          />
        )}

        {/* DaVinci Style Page Switcher */}
        <div className="h-10 bg-[#0c0c0e] border-t border-[#1f1f23] flex items-center justify-center gap-12 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50">
          {([
            { id: "media", label: "Media" },
            { id: "cut", label: "Cut" },
            { id: "edit", label: "Edit" },
            { id: "fusion", label: "Fusion" },
            { id: "color", label: "Color" },
            { id: "audio", label: "Fairlight" },
            { id: "deliver", label: "Deliver" },
            { id: "ai_hub", label: "AI Hub" },
          ] as const).map((page) => (
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`text-[9px] font-black uppercase tracking-widest transition-all px-4 py-1.5 rounded relative ${
                activePage === page.id
                  ? "text-white"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {page.label}
              {activePage === page.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_10px_red]"></div>
              )}
            </button>
          ))}
        </div>

        {isSettingsOpen && (
          <SettingsModal onClose={() => setIsSettingsOpen(false)} showToast={showToast} />
        )}

        {toast && (
          <div className={`fixed bottom-16 right-8 px-6 py-4 rounded-xl border shadow-2xl z-[100] animate-in slide-in-from-right duration-300 flex items-center gap-4 ${
            toast.type === 'success' ? 'bg-zinc-900 border-green-500/50 text-white' : 'bg-red-950/20 border-red-500/50 text-red-200'
          }`}>
             <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
             <p className="text-xs font-black uppercase tracking-widest">{toast.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
