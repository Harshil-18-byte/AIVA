declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceControlProps {
  onCommand: (intent: string, text: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  wakeWord?: string;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ onCommand, showToast, wakeWord = 'AIVA' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);

  const isListeningRef = useRef(false);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      await audioContext.resume();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      audioChunksRef.current = [];
      isListeningRef.current = true;
      
      processor.onaudioprocess = (e) => {
        if (!isListeningRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        audioChunksRef.current.push(new Float32Array(inputData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processorRef.current = processor;
      setIsListening(true);
      showToast("Listening...", "success");
    } catch (e) {
      console.error(e);
      showToast("Microphone access denied", "error");
    }
  };

  const stopListening = async () => {
    if (!audioContextRef.current || !isListening) return;
    
    setIsListening(false);
    isListeningRef.current = false;
    setIsProcessing(true);

    // Stop tracks
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    processorRef.current?.disconnect();
    
    // Capture sample rate before closing
    const contextSr = audioContextRef.current?.sampleRate || 16000;
    
    audioContextRef.current?.close();

    // Flatten chunks
    const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
    if (totalLength === 0) {
        showToast("No audio recorded", "error");
        setIsProcessing(false);
        setIsListening(false);
        isListeningRef.current = false;
        return;
    }

    const combinedAudio = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunksRef.current) {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
    }

    // Convert to regular array for JSON
    const audioArray = Array.from(combinedAudio);

    try {
        const response = await fetch('http://localhost:8000/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                audio: audioArray,
                sr: contextSr,
                wake_word: wakeWord
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.detail || `Server Error ${response.status}`);
        }
        
        if (data.error) {
            showToast(`Voice Error: ${data.reason}`, 'error');
            return;
        }

        if (data.intent && data.intent !== 'UNKNOWN') {
            onCommand(data.intent, data.text);
        } else {
            showToast(`Heard: "${data.text}" (No Command)`, 'error');
        }
    } catch (e) {
        console.error("Voice Error:", e);
        showToast(`Voice Error: ${e instanceof Error ? e.message : 'Unknown error'}`, "error");
    } finally {
        setIsProcessing(false);
        audioContextRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
  };

  return (
    <button 
        onClick={toggleListening}
        disabled={isProcessing}
        className={`relative p-2 rounded-full transition-all flex items-center gap-2 ${
            isListening 
            ? 'bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50' 
            : (isProcessing ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-[#2c2c30] text-[#a1a1aa] hover:text-white')
        }`}
        title="Voice Control"
    >
        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : (isListening ? <MicOff size={18} /> : <Mic size={18} />)}
        <span className={`text-xs font-bold uppercase tracking-wide hidden md:inline-block ${isListening ? 'text-red-500' : ''}`}>
            {isProcessing ? 'Processing...' : (isListening ? `Listening to ${wakeWord}...` : 'Voice Command')}
        </span>
        {isListening && <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>}
    </button>
  );
};
