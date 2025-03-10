
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
          amplitude: baseAmplitude + audioLevel * 0.3,
          speed: baseSpeed * 1.5,
          intensity: baseIntensity + audioLevel * 0.6,
          colors: ['#59c0e8', '#e06ebb', '#42e8d5', '#e06ebb', '#59c0e8'],
          formCount: 5,
          glowIntensity: 1.2 + audioLevel * 0.5
        };
      case 'speaking':
        return {
          amplitude: baseAmplitude + audioLevel * 0.4,
          speed: baseSpeed * 2.5,
          intensity: baseIntensity + audioLevel * 0.7,
          colors: ['#e06ebb', '#42e8d5', '#59c0e8', '#42e8d5', '#e06ebb'],
          formCount: 5,
          glowIntensity: 1.5 + audioLevel * 0.6
        };
      default: // idle
        return {
          amplitude: baseAmplitude,
          speed: baseSpeed,
          intensity: baseIntensity,
          colors: ['#42e8d5', '#59c0e8', '#e06ebb', '#59c0e8', '#42e8d5'],
          formCount: 5,
          glowIntensity: 0.9
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
      outerGlow.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = outerGlow;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Draw sphere background with 3D effect
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      const sphereGradient = ctx.createRadialGradient(
        centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.1,
        centerX, centerY, radius * 1.2
      );
      sphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
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
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.fill();
      
      // Clip all further drawing to the circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw 5 individual organic forms that undulate in 3D space
      for (let formIndex = 0; formIndex < config.formCount; formIndex++) {
        const color = config.colors[formIndex % config.colors.length];
        
        // Apply neon glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 20 * config.glowIntensity;
        
        // Create initial phase offset for each form for more varied movement
        const phaseOffset = formIndex * (Math.PI * 2 / config.formCount);
        
        // Create a form that's always connected to the center
        ctx.beginPath();
        
        // Calculate form expansion based on audio level
        const expansionFactor = 0.5 + (audioLevel * 0.5);
        const maxRadius = radius * 0.95; // Keep within sphere bounds
        
        // Create a more dynamic, organic shape that undulates from the center
        const segmentCount = 36; // More segments for smoother curves
        
        for (let j = 0; j <= segmentCount; j++) {
          const segmentAngle = (j / segmentCount) * Math.PI * 2;
          const angle = segmentAngle + time * config.speed * (1 + formIndex * 0.3) + phaseOffset;
          
          // Use sine and cosine waves of different frequencies for more organic shapes
          const frequencyA = 2 + formIndex * 0.5;
          const frequencyB = 3 + formIndex * 0.7;
          const frequencyC = 4 + formIndex * 0.4;
          
          // Create pulsing effect based on time and audio
          const pulseFactor = 0.6 + 
            Math.sin(time * 1.2 + formIndex * 0.5) * 0.2 + 
            (state !== 'idle' ? audioLevel * 0.3 : 0);
          
          // Create organic distortion based on multiple sine waves
          const distortion = 
            Math.sin(angle * frequencyA + time * 2) * config.amplitude * 0.7 +
            Math.cos(angle * frequencyB + time * 1.5) * config.amplitude * 0.5 +
            Math.sin(angle * frequencyC + time * 3) * config.amplitude * 0.3;
          
          // Distance from center varies with audioLevel
          const distanceMultiplier = 0.3 + (expansionFactor * 0.7);
          
          // Calculate the radius for this point with breathing effect
          const breathingEffect = 0.7 + Math.sin(time * 0.8 + formIndex) * 0.3;
          const baseFormRadius = radius * distanceMultiplier * pulseFactor * breathingEffect;
          
          // Apply distortion based on current audio level and state
          const audioDistortion = state !== 'idle' 
            ? distortion * radius * 0.3 * config.intensity 
            : distortion * radius * 0.2 * config.intensity;
          
          // Calculate final form radius with constraints
          const formRadius = Math.min(baseFormRadius + audioDistortion, maxRadius);
          
          // Calculate 3D effect using z-factor - makes forms appear to move in and out of screen
          const zFactor = 0.7 + Math.sin(angle * 2 + time * 1.5 + formIndex * 0.7) * 0.3;
          
          // Apply 3D perspective to x and y coordinates
          const x = centerX + Math.cos(angle) * formRadius * zFactor;
          const y = centerY + Math.sin(angle) * formRadius * zFactor;
          
          // Define path
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            // Calculate control points for smooth, organic curves
            // Distance between control points affects the smoothness and undulation
            const prevAngle = ((j - 1) / segmentCount) * Math.PI * 2 + time * config.speed * (1 + formIndex * 0.3) + phaseOffset;
            const prevDistortion = 
              Math.sin(prevAngle * frequencyA + time * 2) * config.amplitude * 0.7 +
              Math.cos(prevAngle * frequencyB + time * 1.5) * config.amplitude * 0.5 +
              Math.sin(prevAngle * frequencyC + time * 3) * config.amplitude * 0.3;
            
            const prevPulseFactor = 0.6 + 
              Math.sin(time * 1.2 + formIndex * 0.5 - 0.1) * 0.2 + 
              (state !== 'idle' ? audioLevel * 0.3 : 0);
            
            const prevBreathingEffect = 0.7 + Math.sin(time * 0.8 + formIndex - 0.1) * 0.3;
            const prevBaseFormRadius = radius * distanceMultiplier * prevPulseFactor * prevBreathingEffect;
            
            const prevAudioDistortion = state !== 'idle' 
              ? prevDistortion * radius * 0.3 * config.intensity 
              : prevDistortion * radius * 0.2 * config.intensity;
            
            const prevFormRadius = Math.min(prevBaseFormRadius + prevAudioDistortion, maxRadius);
            
            const prevZFactor = 0.7 + Math.sin(prevAngle * 2 + time * 1.5 + formIndex * 0.7) * 0.3;
            
            const prevX = centerX + Math.cos(prevAngle) * prevFormRadius * prevZFactor;
            const prevY = centerY + Math.sin(prevAngle) * prevFormRadius * prevZFactor;
            
            // Calculate control point - adjust these for different curve styles
            const midAngle = (prevAngle + angle) / 2;
            const controlDistanceFactor = 0.8 + Math.sin(time * 2 + j * 0.3 + formIndex) * 0.2;
            
            const controlDistance = 
              ((prevFormRadius * prevZFactor) + (formRadius * zFactor)) / 2 * 
              controlDistanceFactor * 
              (1 + audioLevel * 0.3);
            
            const cpX = centerX + Math.cos(midAngle) * controlDistance;
            const cpY = centerY + Math.sin(midAngle) * controlDistance;
            
            // Use quadratic curve for smoother, organic shapes
            ctx.quadraticCurveTo(cpX, cpY, x, y);
          }
        }
        
        ctx.closePath();
        
        // Create radial gradient with neon effect
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        
        // Apply color based on state and form index
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(0.3, `${color}ee`);  // More opaque near center
        gradient.addColorStop(0.7, `${color}99`);  // Semi-transparent mid
        gradient.addColorStop(1, `${color}55`);    // Very transparent at edges
        
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen'; // Creates light blend for neon effect
        ctx.fill();
        
        // Add inner highlight to show 3D effect
        const innerRadius = radius * 0.1 * (1 + (audioLevel * 0.5));
        const highlightColor = state === 'listening' ? '#e06ebb' : state === 'speaking' ? '#42e8d5' : '#59c0e8';
        
        ctx.beginPath();
        ctx.arc(
          centerX, 
          centerY, 
          innerRadius,
          0, Math.PI * 2
        );
        
        const innerGlow = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, innerRadius
        );
        innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        innerGlow.addColorStop(0.5, `${highlightColor}99`);
        innerGlow.addColorStop(1, `${highlightColor}00`);
        
        ctx.fillStyle = innerGlow;
        ctx.globalCompositeOperation = 'screen';
        ctx.fill();
      }
      
      // Reset shadow for central glow
      ctx.shadowBlur = 0;
      
      // Draw central glow
      ctx.beginPath();
      const glowRadius = radius * 0.15 * (1 + audioLevel * 0.5) * (1 + Math.sin(time * 2) * 0.1);
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowRadius
      );
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      glowGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.7)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.globalCompositeOperation = 'screen';
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add small highlight spots (like reflections)
      const spotColor = state === 'idle' ? '#59c0e8' : 
                        state === 'listening' ? '#e06ebb' : '#42e8d5';
      
      // Highlight spots that move with audio
      const spotCount = 3;
      for (let i = 0; i < spotCount; i++) {
        const angle = (i / spotCount) * Math.PI * 2 + time;
        const spotDistance = radius * (0.35 + audioLevel * 0.15);
        
        ctx.beginPath();
        ctx.ellipse(
          centerX + Math.cos(angle) * spotDistance, 
          centerY + Math.sin(angle) * spotDistance, 
          radius * 0.04,
          radius * 0.02,
          angle + Math.PI/4, 
          0, Math.PI * 2
        );
        ctx.fillStyle = `${spotColor}99`;
        ctx.globalCompositeOperation = 'lighten';
        ctx.fill();
      }
      
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
        className="absolute inset-0 celestial-glow rounded-full opacity-70"
        style={{
          background: state === 'idle' 
            ? 'radial-gradient(circle, rgba(89,192,232,0.35) 0%, rgba(89,192,232,0) 70%)' 
            : state === 'listening'
            ? 'radial-gradient(circle, rgba(224,110,187,0.45) 0%, rgba(224,110,187,0) 70%)'
            : 'radial-gradient(circle, rgba(66,232,213,0.45) 0%, rgba(66,232,213,0) 70%)'
        }}
      />
    </div>
  );
};

export default CelestialCanvas;
