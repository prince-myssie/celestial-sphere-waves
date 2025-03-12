
import React, { useRef, useEffect, useState } from 'react';
import { renderCelestialCanvas } from '@/utils/celestialRenderer';
import { CelestialState } from '@/types/celestial';

interface AgentState {
  state: 'disconnected' | 'connecting' | 'initializing' | 'listening' | 'thinking' | 'speaking';
}

interface CanvasProps {
  size?: number;
  state: AgentState['state'];
  audioLevel?: number;
}

const CanvasComp: React.FC<CanvasProps> = ({
  size = 200,
  state,
  audioLevel = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | NodeJS.Timeout>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeRef = useRef(0);

  // Map AgentState to CelestialState (they're the same in this case, but we want to be explicit)
  const mapToCelestialState = (agentState: AgentState['state']): CelestialState => {
    return agentState as CelestialState;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = size;

    // Set canvas size with pixel ratio for sharp rendering
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    ctx.scale(dpr, dpr);

    setIsInitialized(true);

    return () => {
      clearTimeout(animationRef.current as NodeJS.Timeout);
    };
  }, [size]);

  useEffect(() => {
    if (!isInitialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const celestialState = mapToCelestialState(state);

    // High-performance animation using setTimeout and requestAnimationFrame
    const animate = () => {
      renderCelestialCanvas(ctx, timeRef.current, size, celestialState, audioLevel);
      timeRef.current += 0.01; // Time increment controls animation speed
      
      // Ultra-fast animation cadence (1000 frames every 2ms)
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 2);
    };
    
    animate();
    
    return () => {
      clearTimeout(animationRef.current as NodeJS.Timeout);
    };
  }, [isInitialized, size, state, audioLevel]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        borderRadius: '50%', // Make the canvas circular
        background: 'transparent'
      }}
    />
  );
};

export default CanvasComp;
