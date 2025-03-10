
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
        count: 3,
        scale: 0.4,
        variation: 0.05,
        colors: ['#59c0e8', '#e06ebb', '#42e8d5']
      },
      listening: {
        count: 4,
        scale: 0.45 + audioLevel * 0.1,
        variation: 0.1 + audioLevel * 0.05,
        colors: ['#e06ebb', '#59c0e8', '#42e8d5', '#e06ebb']
      },
      speaking: {
        count: 5,
        scale: 0.5 + audioLevel * 0.15,
        variation: 0.15 + audioLevel * 0.1,
        colors: ['#42e8d5', '#e06ebb', '#59c0e8', '#42e8d5', '#e06ebb']
      }
    };
    
    const { count, scale, variation, colors } = config[state];
    const center = size / 2;
    const radius = size * scale;
    
    const blobs = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + offset;
      const blobScale = 1 + Math.sin(offset * 2 + i) * variation;
      
      // Create different blob shapes based on their index
      const points = [];
      const pointCount = 6 + i % 3;
      
      for (let j = 0; j <= pointCount; j++) {
        const pointAngle = (j / pointCount) * Math.PI * 2;
        const distortion = Math.sin(offset * 3 + i + j) * variation * radius;
        const pointRadius = radius * blobScale + distortion;
        
        const x = center + Math.cos(angle + pointAngle) * pointRadius;
        const y = center + Math.sin(angle + pointAngle) * pointRadius;
        
        if (j === 0) {
          points.push(`M${x},${y}`);
        } else if (j === pointCount) {
          points.push(`Z`);
        } else {
          // Use quadratic bezier curves for smoother shapes
          const prevAngle = ((j - 1) / pointCount) * Math.PI * 2;
          const cpAngle = (prevAngle + pointAngle) / 2;
          const cpDistortion = Math.sin(offset * 2 + i + j) * variation * radius * 1.5;
          const cpRadius = radius * blobScale + cpDistortion;
          
          const cpx = center + Math.cos(angle + cpAngle) * cpRadius;
          const cpy = center + Math.sin(angle + cpAngle) * cpRadius;
          
          points.push(`Q${cpx},${cpy} ${x},${y}`);
        }
      }
      
      blobs.push({
        path: points.join(' '),
        color: colors[i % colors.length],
        opacity: 0.8 - (i / count) * 0.3,
        animationDelay: `${i * 0.5}s`
      });
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
          <radialGradient id="sphereGradient" cx="40%" cy="40%" r="60%" fx="40%" fy="40%">
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
          
          {/* Create gradients for each blob */}
          {blobs.map((blob, index) => (
            <radialGradient 
              key={`grad-${index}`}
              id={`blobGradient-${index}`} 
              cx="50%" 
              cy="50%" 
              r="60%" 
              fx="30%" 
              fy="30%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="50%" stopColor={blob.color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={blob.color} stopOpacity="0.1" />
            </radialGradient>
          ))}
        </defs>
        
        {/* Outer glow */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.45} 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.2)" 
          strokeWidth="1" 
          filter="url(#glow)"
        />
        
        {/* Container Circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.4} 
          fill="url(#sphereGradient)" 
          opacity="0.7"
        />
        
        {/* Render blob shapes */}
        <g>
          {blobs.map((blob, index) => (
            <path
              key={index}
              d={blob.path}
              fill={`url(#blobGradient-${index})`}
              opacity={blob.opacity}
              className="animate-blob-movement"
              style={{ 
                animationDelay: blob.animationDelay,
                transform: `translate(${size / 2}px, ${size / 2}px) scale(${1 + Math.sin(offset + index) * 0.05}) rotate(${Math.sin(offset * 0.5 + index) * 10}deg) translate(-${size / 2}px, -${size / 2}px)` 
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
        />
      </svg>
      
      {/* External glow effect */}
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

export default CelestialSVG;
