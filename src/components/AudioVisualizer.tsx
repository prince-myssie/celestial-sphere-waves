
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Play, Square, Upload, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  onAudioLevelChange: (level: number) => void;
  onStateChange: (state: 'idle' | 'listening' | 'speaking') => void;
  className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  onAudioLevelChange,
  onStateChange,
  className
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioElementRef.current = new Audio();
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);
  
  // Setup audio analysis
  const setupAudioAnalysis = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
  };
  
  // Process audio data
  const processAudioData = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevel = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avgLevel = sum / bufferLength / 255;
      
      // Apply smoothing
      setAudioLevel(prev => prev * 0.7 + avgLevel * 0.3);
      onAudioLevelChange(audioLevel);
      
      // Continue updating
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };
  
  // Start microphone input
  const startListening = async () => {
    try {
      setupAudioAnalysis();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      if (audioContextRef.current && analyserRef.current) {
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
        
        setIsListening(true);
        setIsSpeaking(false);
        onStateChange('listening');
        
        processAudioData();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  // Stop microphone input
  const stopListening = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    setIsListening(false);
    onStateChange('idle');
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAudioFile(files[0]);
      if (audioElementRef.current) {
        const url = URL.createObjectURL(files[0]);
        audioElementRef.current.src = url;
      }
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Start audio playback
  const startSpeaking = () => {
    if (!audioFile && !audioElementRef.current?.src) {
      triggerFileUpload();
      return;
    }
    
    stopListening();
    setupAudioAnalysis();
    
    if (audioElementRef.current && audioContextRef.current && analyserRef.current) {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      audioElementRef.current.play();
      
      setIsSpeaking(true);
      onStateChange('speaking');
      
      processAudioData();
    }
  };
  
  // Stop audio playback
  const stopSpeaking = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    setIsSpeaking(false);
    onStateChange('idle');
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="flex items-center gap-4">
        <Button 
          variant={isListening ? "destructive" : "secondary"}
          size="icon"
          onClick={isListening ? stopListening : startListening}
          className="rounded-full h-12 w-12 shadow-md"
        >
          {isListening ? <Square size={18} /> : <Mic size={18} />}
        </Button>
        
        <Button
          variant={isSpeaking ? "destructive" : "secondary"}
          size="icon"
          onClick={isSpeaking ? stopSpeaking : startSpeaking}
          className="rounded-full h-12 w-12 shadow-md"
        >
          {isSpeaking ? <Square size={18} /> : <Volume2 size={18} />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={triggerFileUpload}
          className="rounded-full h-12 w-12 shadow-md"
        >
          <Upload size={18} />
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef}
          accept="audio/*"
          className="hidden" 
          onChange={handleFileUpload}
        />
      </div>
      
      {audioFile && (
        <p className="text-sm text-gray-300 truncate max-w-xs">
          Fichier: {audioFile.name}
        </p>
      )}
      
      <div className="w-full max-w-xs bg-gray-700/30 h-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-celestial-blue via-celestial-pink to-celestial-teal transition-all duration-100 ease-out"
          style={{ width: `${audioLevel * 100}%` }}
        />
      </div>
    </div>
  );
};

export default AudioVisualizer;
