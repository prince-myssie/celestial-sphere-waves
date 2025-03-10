
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
  const prevLevelRef = useRef(0);
  
  // Initialize audio element
  useEffect(() => {
    audioElementRef.current = new Audio();
    audioElementRef.current.addEventListener('ended', () => {
      stopSpeaking();
    });
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.removeEventListener('ended', stopSpeaking);
        audioElementRef.current = null;
      }
    };
  }, []);
  
  // Setup audio analysis
  const setupAudioAnalysis = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512; // Higher resolution for better analysis
      analyserRef.current.smoothingTimeConstant = 0.8; // Smoother transitions
    }
  };
  
  // Process audio data with enhanced frequency analysis
  const processAudioData = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevel = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      // Enhanced audio level calculation with frequency weighting
      // Focus more on middle frequencies which are more present in voice/music
      let bassSum = 0;
      let midSum = 0;
      let trebleSum = 0;
      const bassRange = Math.floor(bufferLength * 0.1); // 0-10% of frequencies
      const midRange = Math.floor(bufferLength * 0.6);  // 10-70% of frequencies
      const trebleRange = bufferLength - bassRange - midRange; // 70-100% of frequencies
      
      // Calculate weighted averages by frequency range
      for (let i = 0; i < bassRange; i++) {
        bassSum += dataArray[i];
      }
      for (let i = bassRange; i < bassRange + midRange; i++) {
        midSum += dataArray[i];
      }
      for (let i = bassRange + midRange; i < bufferLength; i++) {
        trebleSum += dataArray[i];
      }
      
      const bassAvg = bassSum / bassRange / 255;
      const midAvg = midSum / midRange / 255;
      const trebleAvg = trebleSum / trebleRange / 255;
      
      // Weight the frequencies - give more importance to mids
      const weightedLevel = (bassAvg * 0.3) + (midAvg * 0.5) + (trebleAvg * 0.2);
      
      // Apply smoother transitions to avoid jerky movements
      // Use an adaptive smoothing factor - faster response for increasing levels
      const smoothingUp = 0.7; // Faster response on increasing volume
      const smoothingDown = 0.85; // Slower decay on decreasing volume
      
      const smoothingFactor = weightedLevel > prevLevelRef.current ? smoothingUp : smoothingDown;
      const smoothedLevel = (prevLevelRef.current * smoothingFactor) + (weightedLevel * (1 - smoothingFactor));
      
      // Apply non-linear scaling to make small sounds more visible
      // This enhances visual response at lower volumes
      const enhancedLevel = Math.pow(smoothedLevel, 0.7);
      
      setAudioLevel(enhancedLevel);
      onAudioLevelChange(enhancedLevel);
      prevLevelRef.current = smoothedLevel;
      
      // Continue updating
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };
  
  // Start microphone input with enhanced configuration
  const startListening = async () => {
    try {
      setupAudioAnalysis();
      
      // Request microphone with more specific constraints for better audio quality
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // Better for capturing natural volume levels
          sampleRate: 48000 // Higher sample rate for better quality
        } 
      });
      
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
    setTimeout(() => {
      setAudioLevel(0);
      onAudioLevelChange(0);
    }, 100);
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAudioFile(files[0]);
      if (audioElementRef.current) {
        const url = URL.createObjectURL(files[0]);
        audioElementRef.current.src = url;
        
        // Start playing automatically when a file is selected
        startSpeaking();
      }
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Start audio playback with enhanced processing
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
      
      // Resume audio context if it's suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      // Add a small delay before playing to give the audio context time to initialize
      setTimeout(() => {
        if (audioElementRef.current) {
          audioElementRef.current.play()
            .catch(err => {
              console.error('Error playing audio:', err);
            });
        }
      }, 100);
      
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
    setTimeout(() => {
      setAudioLevel(0);
      onAudioLevelChange(0);
    }, 100);
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
          className={cn(
            "rounded-full h-12 w-12 shadow-md transition-all duration-300", 
            isListening && "neon-glow"
          )}
        >
          {isListening ? <Square size={18} /> : <Mic size={18} />}
        </Button>
        
        <Button
          variant={isSpeaking ? "destructive" : "secondary"}
          size="icon"
          onClick={isSpeaking ? stopSpeaking : startSpeaking}
          className={cn(
            "rounded-full h-12 w-12 shadow-md transition-all duration-300",
            isSpeaking && "neon-glow"
          )}
        >
          {isSpeaking ? <Square size={18} /> : <Volume2 size={18} />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={triggerFileUpload}
          className="rounded-full h-12 w-12 shadow-md transition-all duration-300 hover:bg-gray-800/40"
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
      
      <div className="w-full max-w-xs bg-gray-700/30 h-3 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-celestial-blue via-celestial-pink to-celestial-teal transition-all duration-100 ease-out"
          style={{ 
            width: `${Math.min(audioLevel * 100, 100)}%`,
            boxShadow: `0 0 10px rgba(${audioLevel > 0.7 ? '224, 110, 187' : '89, 192, 232'}, ${audioLevel * 0.8})`
          }}
        />
      </div>
      
      <div className="flex gap-2 mt-1">
        <div className={cn(
          "w-1 h-1 rounded-full bg-celestial-blue transition-all",
          audioLevel > 0.05 && "w-2 h-2 neon-glow"
        )} style={{ opacity: audioLevel > 0.05 ? 1 : 0.5 }}></div>
        <div className={cn(
          "w-1 h-1 rounded-full bg-celestial-pink transition-all",
          audioLevel > 0.2 && "w-2 h-2 neon-glow"
        )} style={{ opacity: audioLevel > 0.2 ? 1 : 0.5 }}></div>
        <div className={cn(
          "w-1 h-1 rounded-full bg-celestial-teal transition-all",
          audioLevel > 0.4 && "w-2 h-2 neon-glow"
        )} style={{ opacity: audioLevel > 0.4 ? 1 : 0.5 }}></div>
        <div className={cn(
          "w-1 h-1 rounded-full bg-celestial-pink transition-all",
          audioLevel > 0.6 && "w-2 h-2 neon-glow"
        )} style={{ opacity: audioLevel > 0.6 ? 1 : 0.5 }}></div>
        <div className={cn(
          "w-1 h-1 rounded-full bg-celestial-blue transition-all",
          audioLevel > 0.8 && "w-2 h-2 neon-glow"
        )} style={{ opacity: audioLevel > 0.8 ? 1 : 0.5 }}></div>
      </div>
    </div>
  );
};

export default AudioVisualizer;
