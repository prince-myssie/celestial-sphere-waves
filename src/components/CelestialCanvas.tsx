
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type CelestialState = 'idle' | 'listening' | 'speaking';

interface CelestialCanvasProps {
  size?: number;
  state: CelestialState;
  audioLevel?: number;
  className?: string;
}

const CelestialCanvas: React.FC<CelestialCanvasProps> = ({
  size = 300,
  state = 'idle',
  audioLevel = 0,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Wave properties configuration based on state
  const getConfig = (state: CelestialState, audioLevel: number) => {
    const baseAmplitude = 0.2;
    const baseSpeed = 0.002;
    const baseIntensity = 0.4;
    
    switch (state) {
      case 'listening':
        return {
          amplitude: baseAmplitude + audioLevel * 0.1,
          speed: baseSpeed * 1.5,
          intensity: baseIntensity + audioLevel * 0.2,
          colors: ['#59c0e8', '#e06ebb', '#42e8d5']
        };
      case 'speaking':
        return {
          amplitude: baseAmplitude + audioLevel * 0.15,
          speed: baseSpeed * 2,
          intensity: baseIntensity + audioLevel * 0.3,
          colors: ['#e06ebb', '#42e8d5', '#59c0e8']
        };
      default: // idle
        return {
          amplitude: baseAmplitude,
          speed: baseSpeed,
          intensity: baseIntensity,
          colors: ['#42e8d5', '#59c0e8', '#e06ebb']
        };
    }
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
      cancelAnimationFrame(animationRef.current);
    };
  }, [size]);

  useEffect(() => {
    if (!isInitialized) return;

    let time = 0;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      const config = getConfig(state, audioLevel);
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.4;
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Draw outer sphere (semi-transparent)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.05, 0, Math.PI * 2);
      const outerGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius * 1.2
      );
      outerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      outerGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
      outerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.fillStyle = outerGradient;
      ctx.fill();
      
      // Draw sphere background
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      const sphereGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
        centerX, centerY, radius * 1.2
      );
      sphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      sphereGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      sphereGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sphereGradient;
      ctx.fill();
      
      // Clip all further drawing to the circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw waves or forms based on state
      for (let i = 0; i < 3; i++) {
        const waveOffset = (Math.PI * 2 / 3) * i + time * (config.speed * (i + 1));
        const color = config.colors[i % config.colors.length];
        
        const segments = 3;
        const segmentAngle = Math.PI * 2 / segments;
        
        ctx.beginPath();
        
        for (let j = 0; j <= segments; j++) {
          const angle = j * segmentAngle + waveOffset;
          const waveRadius = radius * (0.3 + Math.sin(time * 0.5 + i) * 0.1);
          
          const x = centerX + Math.cos(angle) * waveRadius;
          const y = centerY + Math.sin(angle) * waveRadius;
          
          if (j === 0) {
            ctx.moveTo(centerX, centerY);
          } else {
            const cp1x = centerX + Math.cos(angle - segmentAngle / 2) * waveRadius * 1.5;
            const cp1y = centerY + Math.sin(angle - segmentAngle / 2) * waveRadius * 1.5;
            
            const intensity = Math.sin(time * 0.5) * 0.5 + 0.5;
            const amplitudeFactor = config.amplitude * (1 + Math.sin(time * 3 + i * 2) * 0.2);
            
            // Modulate control points for more dynamic shapes
            ctx.quadraticCurveTo(
              cp1x + Math.cos(time * 2 + i) * amplitudeFactor * radius,
              cp1y + Math.sin(time * 2 + i) * amplitudeFactor * radius,
              x, y
            );
          }
        }
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, `${color}CC`);
        gradient.addColorStop(1, `${color}22`);
        
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen';
        ctx.fill();
      }
      
      // Draw central glow
      ctx.beginPath();
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * 0.5
      );
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.globalCompositeOperation = 'lighten';
      ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
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
        className="absolute inset-0 celestial-glow rounded-full opacity-50"
        style={{
          background: state === 'idle' 
            ? 'radial-gradient(circle, rgba(89,192,232,0.2) 0%, rgba(89,192,232,0) 70%)' 
            : state === 'listening'
            ? 'radial-gradient(circle, rgba(224,110,187,0.3) 0%, rgba(224,110,187,0) 70%)'
            : 'radial-gradient(circle, rgba(66,232,213,0.3) 0%, rgba(66,232,213,0) 70%)'
        }}
      />
    </div>
  );
};

export default CelestialCanvas;
