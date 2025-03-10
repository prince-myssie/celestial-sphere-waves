
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
          amplitude: baseAmplitude + audioLevel * 0.15,
          speed: baseSpeed * 1.5,
          intensity: baseIntensity + audioLevel * 0.3,
          colors: ['#59c0e8', '#e06ebb', '#42e8d5', '#e06ebb'],
          blobCount: 4
        };
      case 'speaking':
        return {
          amplitude: baseAmplitude + audioLevel * 0.2,
          speed: baseSpeed * 2,
          intensity: baseIntensity + audioLevel * 0.4,
          colors: ['#e06ebb', '#42e8d5', '#59c0e8', '#42e8d5', '#e06ebb'],
          blobCount: 5
        };
      default: // idle
        return {
          amplitude: baseAmplitude,
          speed: baseSpeed,
          intensity: baseIntensity,
          colors: ['#42e8d5', '#59c0e8', '#e06ebb'],
          blobCount: 3
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
        centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.1,
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
      
      // Draw blobs that extend from center
      for (let i = 0; i < config.blobCount; i++) {
        const color = config.colors[i % config.colors.length];
        const segmentCount = 12; // More segments for smoother curves
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY); // Start at center
        
        for (let j = 0; j <= segmentCount; j++) {
          const angle = (j / segmentCount) * Math.PI * 2 + time * (config.speed * (i + 1));
          
          // Calculate blob radius - make it extend from center
          const blobFactor = Math.sin(time * 0.5 + i) * 0.1;
          const variationFactor = 0.6 + Math.sin(time * 2 + i * 2) * 0.2;
          const audioFactor = state !== 'idle' ? audioLevel * 0.2 : 0;
          const blobRadius = radius * (variationFactor + blobFactor + audioFactor);
          
          // Calculate end point for this segment
          const endX = centerX + Math.cos(angle) * blobRadius;
          const endY = centerY + Math.sin(angle) * blobRadius;
          
          // Make sure blob doesn't exceed the main circle
          const distanceFromCenter = Math.sqrt(Math.pow(endX - centerX, 2) + Math.pow(endY - centerY, 2));
          const maxRadius = radius * 0.95; // Keep blob within sphere
          
          let actualX = endX;
          let actualY = endY;
          
          if (distanceFromCenter > maxRadius) {
            const ratio = maxRadius / distanceFromCenter;
            actualX = centerX + (endX - centerX) * ratio;
            actualY = centerY + (endY - centerY) * ratio;
          }
          
          // Use quadratic curves for smooth edges
          if (j > 0) {
            const prevAngle = ((j - 1) / segmentCount) * Math.PI * 2 + time * (config.speed * (i + 1));
            const prevBlobRadius = radius * (variationFactor + Math.sin(time * 0.5 + i + 0.1) * 0.1 + audioFactor);
            const prevX = centerX + Math.cos(prevAngle) * prevBlobRadius;
            const prevY = centerY + Math.sin(prevAngle) * prevBlobRadius;
            
            // Control point for the curve
            const cpAngle = (prevAngle + angle) / 2;
            const cpDist = blobRadius * (1 + config.amplitude * Math.sin(time * 3 + i));
            const cpX = centerX + Math.cos(cpAngle) * cpDist;
            const cpY = centerY + Math.sin(cpAngle) * cpDist;
            
            ctx.quadraticCurveTo(cpX, cpY, actualX, actualY);
          } else {
            ctx.lineTo(actualX, actualY);
          }
        }
        
        ctx.closePath();
        
        // Create radial gradient from center
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.4, `${color}99`);
        gradient.addColorStop(1, `${color}33`);
        
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
      animationFrameRef.current = requestAnimationFrame(animate);
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
