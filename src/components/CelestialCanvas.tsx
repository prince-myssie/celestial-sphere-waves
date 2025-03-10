
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
    const baseAmplitude = 0.3;
    const baseSpeed = 0.002;
    const baseIntensity = 0.6;
    
    switch (state) {
      case 'listening':
        return {
          amplitude: baseAmplitude + audioLevel * 0.2,
          speed: baseSpeed * 1.5,
          intensity: baseIntensity + audioLevel * 0.4,
          colors: ['#59c0e8', '#e06ebb', '#42e8d5', '#e06ebb'],
          layerCount: 3,
          glowIntensity: 0.8 + audioLevel * 0.3
        };
      case 'speaking':
        return {
          amplitude: baseAmplitude + audioLevel * 0.25,
          speed: baseSpeed * 2,
          intensity: baseIntensity + audioLevel * 0.5,
          colors: ['#e06ebb', '#42e8d5', '#59c0e8', '#42e8d5', '#e06ebb'],
          layerCount: 3,
          glowIntensity: 1.0 + audioLevel * 0.4
        };
      default: // idle
        return {
          amplitude: baseAmplitude,
          speed: baseSpeed,
          intensity: baseIntensity,
          colors: ['#42e8d5', '#59c0e8', '#e06ebb'],
          layerCount: 3,
          glowIntensity: 0.7
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
      const radius = size * 0.42;
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Draw outer glow sphere (larger than the main sphere)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius * 1.4
      );
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
      outerGlow.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = outerGlow;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Draw sphere background with 3D effect
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      const sphereGradient = ctx.createRadialGradient(
        centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.1,
        centerX, centerY, radius * 1.2
      );
      sphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      sphereGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      sphereGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sphereGradient;
      ctx.fill();
      
      // Add subtle 3D highlight
      ctx.beginPath();
      ctx.ellipse(
        centerX - radius * 0.15, 
        centerY - radius * 0.15, 
        radius * 0.2, 
        radius * 0.1, 
        Math.PI * 0.25, 
        0, Math.PI * 2
      );
      const highlightGradient = ctx.createRadialGradient(
        centerX - radius * 0.15, centerY - radius * 0.15, 0,
        centerX - radius * 0.15, centerY - radius * 0.15, radius * 0.2
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.fill();
      
      // Clip all further drawing to the circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw individual blob layers with neon effect
      for (let layer = 0; layer < config.layerCount; layer++) {
        const color = config.colors[layer % config.colors.length];
        const layerScale = 1 - (layer * 0.15); // Each inner layer gets smaller
        const segmentCount = 16; // More segments for smoother curves
        
        // Apply neon glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 * config.glowIntensity;
        
        ctx.beginPath();
        
        // Create smooth, rounded blob
        for (let j = 0; j <= segmentCount; j++) {
          const angle = (j / segmentCount) * Math.PI * 2 + time * (config.speed * (1 + layer * 0.2));
          
          // Calculate dynamic distortion factors
          const pulseFactor = 0.5 + Math.sin(time * 1.5 + layer * 0.7) * 0.2;
          const distortionFactor = Math.sin(time * 3 + j * 0.5 + layer) * config.amplitude;
          
          // Calculate blob radius with distortion
          const baseRadius = radius * layerScale * pulseFactor;
          const distortion = distortionFactor * radius * 0.2 * config.intensity;
          const blobRadius = baseRadius + distortion;
          
          // Calculate position, always ensuring it stays within the sphere bounds
          const maxAllowedRadius = radius * 0.95; // Keep within sphere
          const actualRadius = Math.min(blobRadius, maxAllowedRadius);
          
          const x = centerX + Math.cos(angle) * actualRadius;
          const y = centerY + Math.sin(angle) * actualRadius;
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            // Get previous point for curve calculation
            const prevAngle = ((j - 1) / segmentCount) * Math.PI * 2 + time * (config.speed * (1 + layer * 0.2));
            const prevPulseFactor = 0.5 + Math.sin(time * 1.5 + layer * 0.7 - 0.1) * 0.2;
            const prevDistortionFactor = Math.sin(time * 3 + (j-1) * 0.5 + layer) * config.amplitude;
            const prevBaseRadius = radius * layerScale * prevPulseFactor;
            const prevDistortion = prevDistortionFactor * radius * 0.2 * config.intensity;
            const prevBlobRadius = prevBaseRadius + prevDistortion;
            const prevActualRadius = Math.min(prevBlobRadius, maxAllowedRadius);
            
            const prevX = centerX + Math.cos(prevAngle) * prevActualRadius;
            const prevY = centerY + Math.sin(prevAngle) * prevActualRadius;
            
            // Calculate control point for smooth curve
            // More dynamic control points for organic movement
            const midAngle = (prevAngle + angle) / 2;
            const controlDistanceFactor = 0.5 + Math.sin(time * 2 + j + layer * 0.3) * 0.2;
            const controlPointDistance = (prevActualRadius + actualRadius) / 2 * controlDistanceFactor;
            
            // Calculate control point position with some randomness
            const cpX = centerX + Math.cos(midAngle) * controlPointDistance * (1 + Math.sin(time * 4 + j) * 0.1);
            const cpY = centerY + Math.sin(midAngle) * controlPointDistance * (1 + Math.cos(time * 4 + j) * 0.1);
            
            // Use quadratic curve for smoother, more organic shape
            ctx.quadraticCurveTo(cpX, cpY, x, y);
          }
        }
        
        ctx.closePath();
        
        // Create radial gradient with neon effect
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius * layerScale
        );
        
        // Apply color based on state
        const alphaBase = 0.8 - (layer * 0.2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(0.3, `${color}ee`); // More opaque near center
        gradient.addColorStop(0.7, `${color}88`); // Semi-transparent
        gradient.addColorStop(1, `${color}33`); // Very transparent at edges
        
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen'; // Creates light blend for neon effect
        ctx.fill();
      }
      
      // Reset shadow for central glow
      ctx.shadowBlur = 0;
      
      // Draw central glow
      ctx.beginPath();
      const glowRadius = radius * 0.2 * (1 + Math.sin(time * 2) * 0.05);
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowRadius
      );
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.globalCompositeOperation = 'screen';
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add small highlight spots (like reflections)
      const spotColor = state === 'idle' ? '#59c0e8' : 
                         state === 'listening' ? '#e06ebb' : '#42e8d5';
      
      ctx.beginPath();
      ctx.ellipse(
        centerX + radius * 0.1, 
        centerY - radius * 0.25, 
        radius * 0.05, 
        radius * 0.02, 
        Math.PI * 0.25, 
        0, Math.PI * 2
      );
      ctx.fillStyle = `${spotColor}99`;
      ctx.globalCompositeOperation = 'lighten';
      ctx.fill();
      
      // Second smaller highlight
      ctx.beginPath();
      ctx.ellipse(
        centerX - radius * 0.15, 
        centerY + radius * 0.2, 
        radius * 0.02, 
        radius * 0.01, 
        Math.PI * -0.2, 
        0, Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
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
        className="absolute inset-0 celestial-glow rounded-full opacity-60"
        style={{
          background: state === 'idle' 
            ? 'radial-gradient(circle, rgba(89,192,232,0.3) 0%, rgba(89,192,232,0) 70%)' 
            : state === 'listening'
            ? 'radial-gradient(circle, rgba(224,110,187,0.4) 0%, rgba(224,110,187,0) 70%)'
            : 'radial-gradient(circle, rgba(66,232,213,0.4) 0%, rgba(66,232,213,0) 70%)'
        }}
      />
    </div>
  );
};

export default CelestialCanvas;
