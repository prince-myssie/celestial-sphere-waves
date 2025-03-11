
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { renderCelestialCanvas } from '@/utils/celestialRenderer';
import { CelestialState, CelestialCanvasProps } from '@/types/celestial';

const CelestialCanvas: React.FC<CelestialCanvasProps> = ({
  size = 300,
  state = 'idle',
  audioLevel = 0,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

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
      cancelAnimationFrame(animationRef.current);
    };
  }, [size]);

  useEffect(() => {
    if (!isInitialized) return;

    let time = 0;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      renderCelestialCanvas(ctx, time, size, state, audioLevel);
      time += 0.01;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isInitialized, size, state, audioLevel]);

  return (
    <div className={cn("relative", className)}>
      <canvas 
        ref={canvasRef}
        className="rounded-full"
        style={{
          width: size,
          height: size
        }}
      />
      <div 
        className="absolute inset-0 celestial-glow rounded-full opacity-80"
        style={{
          background: state === 'idle' 
            ? 'radial-gradient(circle, rgba(89,192,232,0.4) 0%, rgba(89,192,232,0) 70%)' 
            : state === 'listening'
            ? 'radial-gradient(circle, rgba(224,110,187,0.5) 0%, rgba(224,110,187,0) 70%)'
            : 'radial-gradient(circle, rgba(66,232,213,0.5) 0%, rgba(66,232,213,0) 70%)'
        }}
      />
    </div>
  );
};

export default CelestialCanvas;
