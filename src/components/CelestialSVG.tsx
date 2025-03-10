
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type CelestialState = 'idle' | 'listening' | 'speaking';

interface CelestialSVGProps {
  size?: number;
  state: CelestialState;
  audioLevel?: number;
  className?: string;
}

const CelestialSVG: React.FC<CelestialSVGProps> = ({
  size = 300,
  state = 'idle',
  audioLevel = 0,
  className
}) => {
  const [offset, setOffset] = useState(0);
  
  // Generate blob shape paths based on state and audio level
  const getBlobs = (state: CelestialState, audioLevel: number) => {
    // Base configuration for different states
    const config = {
      idle: {
        count: 1,
        scale: 0.4,
        variation: 0.05,
        colors: ['#59c0e8', '#e06ebb', '#42e8d5']
      },
      listening: {
        count: 1,
        scale: 0.45 + audioLevel * 0.1,
        variation: 0.1 + audioLevel * 0.05,
        colors: ['#e06ebb', '#59c0e8', '#42e8d5', '#e06ebb']
      },
      speaking: {
        count: 1,
        scale: 0.5 + audioLevel * 0.15,
        variation: 0.15 + audioLevel * 0.1,
        colors: ['#42e8d5', '#e06ebb', '#59c0e8', '#42e8d5', '#e06ebb']
      }
    };
    
    const { count, scale, variation, colors } = config[state];
    const center = size / 2;
    const maxRadius = size * scale;
    
    const blobs = [];
    
    for (let i = 0; i < count; i++) {
      // Set a common anchor point at the center for all blobs
      const anchorX = center;
      const anchorY = center;
      
      // Create different blob shapes using bezier curves for smoothness
      const points = [];
      const pointCount = 12 + i % 4; // Increased point count for smoother shapes
      
      for (let j = 0; j <= pointCount; j++) {
        const angle = (j / pointCount) * Math.PI * 2 + offset * (1 + i * 0.1);
        // Calculate radius for this point - varies with angle and time
        const blobScale = 1 + Math.sin(offset * 2 + i) * variation;
        const distortion = Math.sin(offset * 3 + i + j) * variation * maxRadius;
        const pointRadius = maxRadius * blobScale * (0.5 + Math.sin(offset + i * 0.7) * 0.2) + distortion;
        
        // Ensure radius stays within limits
        const clampedRadius = Math.min(pointRadius, maxRadius);
        
        // Calculate point position
        const x = anchorX + Math.cos(angle) * clampedRadius;
        const y = anchorY + Math.sin(angle) * clampedRadius;
        
        if (j === 0) {
          points.push(`M${x},${y}`);
        } else {
          // Use cubic bezier curves for much smoother shapes
          const prevAngle = ((j - 1) / pointCount) * Math.PI * 2 + offset * (1 + i * 0.1);
          const prevRadius = maxRadius * blobScale * (0.5 + Math.sin(offset + i * 0.7 + 0.1) * 0.2) + 
            Math.sin(offset * 3 + i + (j-1)) * variation * maxRadius;
          const clampedPrevRadius = Math.min(prevRadius, maxRadius);
          
          const prevX = anchorX + Math.cos(prevAngle) * clampedPrevRadius;
          const prevY = anchorY + Math.sin(prevAngle) * clampedPrevRadius;
          
          // Control point 1 - enhanced curve control
          const cp1Angle = prevAngle + (angle - prevAngle) * 0.3;
          const cp1RadiusMod = 1.2 + Math.sin(offset * 2.5) * 0.2; // Dynamic radius modifier
          const cp1Radius = clampedPrevRadius * cp1RadiusMod;
          const cp1x = anchorX + Math.cos(cp1Angle) * cp1Radius;
          const cp1y = anchorY + Math.sin(cp1Angle) * cp1Radius;
          
          // Control point 2 - enhanced curve control
          const cp2Angle = prevAngle + (angle - prevAngle) * 0.7;
          const cp2RadiusMod = 1.2 + Math.sin(offset * 3.2 + 1.5) * 0.2; // Different phase
          const cp2Radius = clampedRadius * cp2RadiusMod;
          const cp2x = anchorX + Math.cos(cp2Angle) * cp2Radius;
          const cp2y = anchorY + Math.sin(cp2Angle) * cp2Radius;
          
          points.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`);
        }
      }
      
      // Close the path
      points.push("Z");
      
      // Create different blobs with varying colors from the palette
      for (let k = 0; k < 3; k++) {
        const offsetMod = k * 0.2;
        const colorIndex = (i + k) % colors.length;
        const opacityBase = 0.75 - (k * 0.15);
        
        // Create different rotation and phase for each layer
        const modifiedPoints = [];
        for (let j = 0; j <= pointCount; j++) {
          const angle = (j / pointCount) * Math.PI * 2 + offset * (1 + (i + k) * 0.15) + offsetMod;
          // Calculate radius with different phase
          const blobScale = 1 + Math.sin(offset * 2 + i + k * 0.5) * variation;
          const distortion = Math.sin(offset * 3 + i + j + k * 0.4) * variation * maxRadius * (1 - k * 0.15);
          const pointRadius = maxRadius * blobScale * (0.5 + Math.sin(offset + (i + k) * 0.7) * 0.2) + distortion;
          
          // Ensure radius stays within limits and shrinks for inner layers
          const layerScaleFactor = 1 - (k * 0.12);
          const clampedRadius = Math.min(pointRadius, maxRadius * layerScaleFactor);
          
          // Calculate point position
          const x = anchorX + Math.cos(angle) * clampedRadius;
          const y = anchorY + Math.sin(angle) * clampedRadius;
          
          if (j === 0) {
            modifiedPoints.push(`M${x},${y}`);
          } else {
            // Use cubic bezier curves for smooth shapes
            const prevAngle = ((j - 1) / pointCount) * Math.PI * 2 + offset * (1 + (i + k) * 0.15) + offsetMod;
            const prevBlobScale = 1 + Math.sin(offset * 2 + i + k * 0.5 + 0.1) * variation;
            const prevDistortion = Math.sin(offset * 3 + i + (j-1) + k * 0.4) * variation * maxRadius * (1 - k * 0.15);
            const prevPointRadius = maxRadius * prevBlobScale * (0.5 + Math.sin(offset + (i + k) * 0.7 + 0.1) * 0.2) + prevDistortion;
            
            const prevClampedRadius = Math.min(prevPointRadius, maxRadius * layerScaleFactor);
            const prevX = anchorX + Math.cos(prevAngle) * prevClampedRadius;
            const prevY = anchorY + Math.sin(prevAngle) * prevClampedRadius;
            
            // Control points for smooth curves
            const cp1Angle = prevAngle + (angle - prevAngle) * 0.3;
            const cp1RadiusMod = 1.2 + Math.sin(offset * 2.5 + k * 0.3) * 0.2;
            const cp1Radius = prevClampedRadius * cp1RadiusMod;
            const cp1x = anchorX + Math.cos(cp1Angle) * cp1Radius;
            const cp1y = anchorY + Math.sin(cp1Angle) * cp1Radius;
            
            const cp2Angle = prevAngle + (angle - prevAngle) * 0.7;
            const cp2RadiusMod = 1.2 + Math.sin(offset * 3.2 + 1.5 + k * 0.3) * 0.2;
            const cp2Radius = clampedRadius * cp2RadiusMod;
            const cp2x = anchorX + Math.cos(cp2Angle) * cp2Radius;
            const cp2y = anchorY + Math.sin(cp2Angle) * cp2Radius;
            
            modifiedPoints.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`);
          }
        }
        
        modifiedPoints.push("Z");
        
        blobs.push({
          path: modifiedPoints.join(' '),
          color: colors[colorIndex],
          opacity: opacityBase - (Math.sin(offset * 1.5 + k) * 0.1),
          animationDelay: `${(i + k) * 0.3}s`
        });
      }
    }
    
    return blobs;
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + 0.01);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  const blobs = getBlobs(state, audioLevel);
  
  return (
    <div className={cn("relative", className)}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="rounded-full"
      >
        {/* Background Circle with subtle gradient */}
        <defs>
          <radialGradient id="sphereGradient" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.5)" />
            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          
          {/* Create filters for glow effects */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Enhanced neon glow filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feFlood floodColor="#fff" floodOpacity="0.5" result="glow" />
            <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
            <feBlend in="SourceGraphic" in2="softGlow" mode="screen" />
          </filter>
          
          {/* Create gradients for each blob */}
          {blobs.map((blob, index) => (
            <radialGradient 
              key={`grad-${index}`}
              id={`blobGradient-${index}`} 
              cx="50%" 
              cy="50%" 
              r="70%" 
              fx="30%" 
              fy="30%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.95" />
              <stop offset="40%" stopColor={blob.color} stopOpacity="0.85" />
              <stop offset="80%" stopColor={blob.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={blob.color} stopOpacity="0.1" />
            </radialGradient>
          ))}
        </defs>
        
        {/* Container Circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.42} 
          fill="url(#sphereGradient)" 
          opacity="0.7"
        />
        
        {/* Outer glow */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.45} 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.15)" 
          strokeWidth="1" 
          filter="url(#glow)"
        />
        
        {/* Render blob shapes */}
        <g filter="url(#neonGlow)">
          {blobs.map((blob, index) => (
            <path
              key={index}
              d={blob.path}
              fill={`url(#blobGradient-${index})`}
              opacity={blob.opacity}
              className={state !== 'idle' ? "animate-pulse-slow" : ""}
              style={{ 
                animationDelay: blob.animationDelay,
                transformOrigin: 'center',
                transformBox: 'fill-box',
                transform: state === 'idle' 
                  ? `scale(${1 + Math.sin(offset + index) * 0.03})`
                  : state === 'listening'
                  ? `scale(${1 + Math.sin(offset * 2 + index) * 0.05 + audioLevel * 0.15})`
                  : `scale(${1 + Math.sin(offset * 3 + index) * 0.08 + audioLevel * 0.2})`
              }}
            />
          ))}
        </g>
        
        {/* Central glow */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.1} 
          fill="url(#glowGradient)" 
          className="animate-pulse-soft"
          filter="url(#glow)"
        />
        
        {/* Highlights - simulating 3D reflection */}
        <ellipse
          cx={size * 0.4} 
          cy={size * 0.4}
          rx={size * 0.05}
          ry={size * 0.03}
          fill="rgba(255, 255, 255, 0.4)"
          transform={`rotate(-20, ${size/2}, ${size/2})`}
          className="animate-pulse-soft"
        />
        
        {/* Secondary highlight */}
        <ellipse
          cx={size * 0.55} 
          cy={size * 0.35}
          rx={size * 0.02}
          ry={size * 0.01}
          fill="rgba(255, 255, 255, 0.5)"
          className="animate-pulse-soft"
          style={{ animationDelay: "0.5s" }}
        />
      </svg>
      
      {/* External glow effect */}
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

export default CelestialSVG;
