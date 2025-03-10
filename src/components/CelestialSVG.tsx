
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
  
  // Generate organic circular forms based on state and audio level
  const getOrbForms = (state: CelestialState, audioLevel: number) => {
    // Configuration based on current state and audio
    const config = {
      idle: {
        formCount: 5,
        scale: 0.45,
        variation: 0.05,
        colors: ['#59c0e8', '#e06ebb', '#42e8d5', '#59c0e8', '#e06ebb']
      },
      listening: {
        formCount: 5,
        scale: 0.5 + audioLevel * 0.15,
        variation: 0.1 + audioLevel * 0.08,
        colors: ['#e06ebb', '#59c0e8', '#42e8d5', '#e06ebb', '#59c0e8']
      },
      speaking: {
        formCount: 5,
        scale: 0.5 + audioLevel * 0.2,
        variation: 0.15 + audioLevel * 0.12,
        colors: ['#42e8d5', '#e06ebb', '#59c0e8', '#42e8d5', '#e06ebb']
      }
    };
    
    const { formCount, scale, variation, colors } = config[state];
    const center = size / 2;
    const maxRadius = size * scale;
    
    const forms = [];
    
    // Generate the 5 interconnected forms
    for (let i = 0; i < formCount; i++) {
      // Anchor point is always the center
      const anchorX = center;
      const anchorY = center;
      
      // Each form has a unique phase offset for varied movement
      const phaseOffset = (i / formCount) * Math.PI * 2;
      
      // Create smooth organic form with bezier curves
      const points = [];
      const pointCount = 24; // High point count for smooth forms
      
      // Create a path that starts from the center and connects back
      for (let j = 0; j <= pointCount; j++) {
        const angle = (j / pointCount) * Math.PI * 2 + offset * (1 + i * 0.2) + phaseOffset;
        
        // Use multiple wave frequencies for more organic shape
        const freq1 = 1 + i * 0.3;
        const freq2 = 2 + i * 0.5;
        const freq3 = 3 + i * 0.2;
        
        // Create a dynamic, pulsing shape based on audio and time
        const pulseFactor = 0.5 + 
          Math.sin(offset * 1.5 + i * 0.8) * 0.2 + 
          (state !== 'idle' ? audioLevel * 0.3 : 0);
        
        // Organic distortion with multiple sine waves
        const distortion = 
          Math.sin(angle * freq1 + offset * 2.5) * variation * 0.7 +
          Math.cos(angle * freq2 + offset * 1.8) * variation * 0.5 +
          Math.sin(angle * freq3 + offset * 3.2) * variation * 0.3;
        
        // Distance from center varies with audio
        const expansionFactor = 0.3 + (audioLevel * 0.7) + Math.sin(offset + i) * 0.2;
        
        // Calculate 3D-like depth effect
        const zDepthFactor = 0.8 + Math.sin(angle * 2 + offset * 1.2 + i * 0.5) * 0.2;
        
        // Calculate form radius with audio reactivity
        const baseRadius = maxRadius * expansionFactor * pulseFactor * zDepthFactor;
        const audioReactiveRadius = baseRadius + (distortion * maxRadius * (0.3 + audioLevel * 0.7));
        
        // Ensure radius stays within sphere bounds
        const formRadius = Math.min(audioReactiveRadius, maxRadius * 0.95);
        
        // Calculate coordinate with 3D-like perspective
        const x = anchorX + Math.cos(angle) * formRadius;
        const y = anchorY + Math.sin(angle) * formRadius;
        
        if (j === 0) {
          points.push(`M${x},${y}`);
        } else {
          // Calculate control points for smooth curves
          const prevAngle = ((j - 1) / pointCount) * Math.PI * 2 + offset * (1 + i * 0.2) + phaseOffset;
          const prevDistortion = 
            Math.sin(prevAngle * freq1 + offset * 2.5) * variation * 0.7 +
            Math.cos(prevAngle * freq2 + offset * 1.8) * variation * 0.5 +
            Math.sin(prevAngle * freq3 + offset * 3.2) * variation * 0.3;
          
          const prevPulseFactor = 0.5 + 
            Math.sin(offset * 1.5 + i * 0.8 - 0.1) * 0.2 + 
            (state !== 'idle' ? audioLevel * 0.3 : 0);
          
          const prevZDepthFactor = 0.8 + Math.sin(prevAngle * 2 + offset * 1.2 + i * 0.5) * 0.2;
          const prevExpansionFactor = 0.3 + (audioLevel * 0.7) + Math.sin(offset + i - 0.1) * 0.2;
          const prevBaseRadius = maxRadius * prevExpansionFactor * prevPulseFactor * prevZDepthFactor;
          const prevAudioReactiveRadius = prevBaseRadius + (prevDistortion * maxRadius * (0.3 + audioLevel * 0.7));
          const prevFormRadius = Math.min(prevAudioReactiveRadius, maxRadius * 0.95);
          
          const prevX = anchorX + Math.cos(prevAngle) * prevFormRadius;
          const prevY = anchorY + Math.sin(prevAngle) * prevFormRadius;
          
          // More natural control points for smoother curves
          const midAngle = (prevAngle + angle) / 2;
          const controlFactor = 1.1 + Math.sin(offset * 2.5 + i * 0.7 + j * 0.2) * 0.2;
          const controlRadius = ((prevFormRadius + formRadius) / 2) * controlFactor * (1 + audioLevel * 0.2);
          
          const cp1x = anchorX + Math.cos(midAngle - 0.2) * controlRadius;
          const cp1y = anchorY + Math.sin(midAngle - 0.2) * controlRadius;
          
          const cp2x = anchorX + Math.cos(midAngle + 0.2) * controlRadius;
          const cp2y = anchorY + Math.sin(midAngle + 0.2) * controlRadius;
          
          // Use cubic bezier for ultra-smooth forms
          points.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`);
        }
      }
      
      points.push("Z");
      
      // Create variation layers for each form with depth effect
      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * 0.08;
        const colorIndex = (i + layer) % colors.length;
        const opacityBase = 0.85 - (layer * 0.2); // Inner layers more opaque
        
        // Different phases and sizes for each layer
        const layerPhaseOffset = phaseOffset + (layer * 0.3);
        const layerPoints = [];
        
        for (let j = 0; j <= pointCount; j++) {
          const angle = (j / pointCount) * Math.PI * 2 + offset * (1 + (i + layer) * 0.15) + layerPhaseOffset;
          
          // Varied frequencies per layer for more organic shapes
          const lFreq1 = 1 + (i + layer) * 0.25;
          const lFreq2 = 2 + (i + layer) * 0.4;
          const lFreq3 = 3 + (i + layer) * 0.15;
          
          // Each layer has unique pulsation
          const layerPulseFactor = 0.5 + 
            Math.sin(offset * 1.5 + (i + layer) * 0.6) * 0.15 + 
            (state !== 'idle' ? audioLevel * (0.25 - layer * 0.05) : 0);
          
          // Layer-specific distortion
          const layerDistortion = 
            Math.sin(angle * lFreq1 + offset * 2.3 + layer) * variation * (0.7 - layer * 0.15) +
            Math.cos(angle * lFreq2 + offset * 1.7 + layer) * variation * (0.5 - layer * 0.1) +
            Math.sin(angle * lFreq3 + offset * 3 + layer) * variation * (0.3 - layer * 0.05);
          
          // Layer-specific expansion factor based on depth
          const layerExpansionFactor = (0.3 - layer * 0.05) + (audioLevel * (0.7 - layer * 0.1)) + 
            Math.sin(offset + i + layer * 0.5) * (0.2 - layer * 0.03);
          
          // 3D depth effect varies per layer
          const layerZDepthFactor = 0.8 + Math.sin(angle * 2 + offset * 1.2 + (i + layer) * 0.4) * (0.2 - layer * 0.05);
          
          // Calculate radius with layered effects
          const layerBaseRadius = maxRadius * layerExpansionFactor * layerPulseFactor * layerZDepthFactor * (1 - layer * 0.15);
          const layerAudioReactiveRadius = layerBaseRadius + (layerDistortion * maxRadius * (0.3 + audioLevel * (0.7 - layer * 0.15)));
          
          // Ensure radius stays within bounds and decreases for inner layers
          const layerRadius = Math.min(layerAudioReactiveRadius, maxRadius * (0.95 - layer * 0.1));
          
          // Calculate coordinate with 3D perspective
          const x = anchorX + Math.cos(angle) * layerRadius;
          const y = anchorY + Math.sin(angle) * layerRadius;
          
          if (j === 0) {
            layerPoints.push(`M${x},${y}`);
          } else {
            // Calculate previous point details
            const prevAngle = ((j - 1) / pointCount) * Math.PI * 2 + offset * (1 + (i + layer) * 0.15) + layerPhaseOffset;
            
            const prevLayerDistortion = 
              Math.sin(prevAngle * lFreq1 + offset * 2.3 + layer) * variation * (0.7 - layer * 0.15) +
              Math.cos(prevAngle * lFreq2 + offset * 1.7 + layer) * variation * (0.5 - layer * 0.1) +
              Math.sin(prevAngle * lFreq3 + offset * 3 + layer) * variation * (0.3 - layer * 0.05);
            
            const prevLayerPulseFactor = 0.5 + 
              Math.sin(offset * 1.5 + (i + layer) * 0.6 - 0.1) * 0.15 + 
              (state !== 'idle' ? audioLevel * (0.25 - layer * 0.05) : 0);
            
            const prevLayerZDepthFactor = 0.8 + Math.sin(prevAngle * 2 + offset * 1.2 + (i + layer) * 0.4) * (0.2 - layer * 0.05);
            const prevLayerExpansionFactor = (0.3 - layer * 0.05) + (audioLevel * (0.7 - layer * 0.1)) + 
              Math.sin(offset + i + layer * 0.5 - 0.1) * (0.2 - layer * 0.03);
            
            const prevLayerBaseRadius = maxRadius * prevLayerExpansionFactor * prevLayerPulseFactor * prevLayerZDepthFactor * (1 - layer * 0.15);
            const prevLayerAudioReactiveRadius = prevLayerBaseRadius + 
              (prevLayerDistortion * maxRadius * (0.3 + audioLevel * (0.7 - layer * 0.15)));
            
            const prevLayerRadius = Math.min(prevLayerAudioReactiveRadius, maxRadius * (0.95 - layer * 0.1));
            
            const prevX = anchorX + Math.cos(prevAngle) * prevLayerRadius;
            const prevY = anchorY + Math.sin(prevAngle) * prevLayerRadius;
            
            // Control points for smooth curves
            const midAngle = (prevAngle + angle) / 2;
            const layerControlFactor = 1.1 + Math.sin(offset * 2.2 + (i + layer) * 0.6 + j * 0.15) * 0.2;
            const controlRadius = ((prevLayerRadius + layerRadius) / 2) * layerControlFactor * (1 + audioLevel * (0.2 - layer * 0.05));
            
            const cp1x = anchorX + Math.cos(midAngle - 0.15 - layer * 0.05) * controlRadius;
            const cp1y = anchorY + Math.sin(midAngle - 0.15 - layer * 0.05) * controlRadius;
            
            const cp2x = anchorX + Math.cos(midAngle + 0.15 + layer * 0.05) * controlRadius;
            const cp2y = anchorY + Math.sin(midAngle + 0.15 + layer * 0.05) * controlRadius;
            
            // Cubic bezier for ultra-smooth forms
            layerPoints.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`);
          }
        }
        
        layerPoints.push("Z");
        
        forms.push({
          path: layerPoints.join(' '),
          color: colors[colorIndex],
          opacity: opacityBase - (Math.sin(offset * 1.5 + layer) * 0.1),
          animationDelay: `${(i + layer) * 0.25}s`,
          index: i * 10 + layer
        });
      }
    }
    
    // Add central connecting form
    const centralPoints = [];
    const centralPointCount = 32;
    const centralRadius = maxRadius * 0.2 * (1 + audioLevel * 0.3);
    
    for (let j = 0; j <= centralPointCount; j++) {
      const angle = (j / centralPointCount) * Math.PI * 2 + offset * 1.5;
      
      // Slight variation for organic feel
      const centralVariation = variation * 0.3;
      const centralDistortion = Math.sin(angle * 5 + offset * 3) * centralVariation;
      
      // Calculate radius with subtle audio reaction
      const centralFormRadius = centralRadius * (1 + centralDistortion + audioLevel * 0.2);
      
      // Calculate position with slight 3D effect
      const x = center + Math.cos(angle) * centralFormRadius;
      const y = center + Math.sin(angle) * centralFormRadius;
      
      if (j === 0) {
        centralPoints.push(`M${x},${y}`);
      } else {
        // Control points for smooth curve
        const prevAngle = ((j - 1) / centralPointCount) * Math.PI * 2 + offset * 1.5;
        const prevCentralDistortion = Math.sin(prevAngle * 5 + offset * 3) * centralVariation;
        const prevCentralFormRadius = centralRadius * (1 + prevCentralDistortion + audioLevel * 0.2);
        
        const prevX = center + Math.cos(prevAngle) * prevCentralFormRadius;
        const prevY = center + Math.sin(prevAngle) * prevCentralFormRadius;
        
        // Curve control
        const midAngle = (prevAngle + angle) / 2;
        const controlRadius = ((prevCentralFormRadius + centralFormRadius) / 2) * 1.1;
        
        const cpX = center + Math.cos(midAngle) * controlRadius;
        const cpY = center + Math.sin(midAngle) * controlRadius;
        
        centralPoints.push(`Q${cpX},${cpY} ${x},${y}`);
      }
    }
    
    centralPoints.push("Z");
    
    // Add central form
    const centralColor = state === 'idle' ? '#59c0e8' : 
                        state === 'listening' ? '#e06ebb' : '#42e8d5';
    
    forms.push({
      path: centralPoints.join(' '),
      color: centralColor,
      opacity: 0.95,
      animationDelay: '0s',
      index: 100 // Highest z-index
    });
    
    return forms;
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + 0.02); // Slightly faster animation
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  const orbForms = getOrbForms(state, audioLevel);
  
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
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          
          {/* Enhanced neon glow filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feFlood floodColor="#fff" floodOpacity="0.5" result="glow" />
            <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
            <feBlend in="SourceGraphic" in2="softGlow" mode="screen" />
          </filter>
          
          {/* Strong neon effect for more intense glow */}
          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="#fff" floodOpacity="0.8" result="glow" />
            <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
            <feBlend in="SourceGraphic" in2="softGlow" mode="screen" />
          </filter>
          
          {/* Create gradients for each organic form */}
          {orbForms.map((form, index) => (
            <radialGradient 
              key={`grad-${index}`}
              id={`formGradient-${index}`} 
              cx="50%" 
              cy="50%" 
              r="70%" 
              fx="30%" 
              fy="30%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.95" />
              <stop offset="40%" stopColor={form.color} stopOpacity="0.85" />
              <stop offset="80%" stopColor={form.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={form.color} stopOpacity="0.1" />
            </radialGradient>
          ))}
        </defs>
        
        {/* Container Circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.42} 
          fill="url(#sphereGradient)" 
          opacity="0.8"
        />
        
        {/* Outer glow */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.47} 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.2)" 
          strokeWidth="2" 
          filter="url(#neonGlow)"
        />
        
        {/* Render organic forms */}
        <g>
          {orbForms.map((form, index) => (
            <path
              key={index}
              d={form.path}
              fill={`url(#formGradient-${index})`}
              opacity={form.opacity}
              filter={form.index === 100 ? "url(#strongGlow)" : "url(#neonGlow)"}
              className="animate-pulse-slow"
              style={{ 
                animationDelay: form.animationDelay,
                transformOrigin: 'center',
                transformBox: 'fill-box',
                transform: state === 'idle' 
                  ? `scale(${1 + Math.sin(offset + index * 0.2) * 0.05})`
                  : state === 'listening'
                  ? `scale(${1 + Math.sin(offset * 2 + index * 0.2) * 0.07 + audioLevel * 0.15})`
                  : `scale(${1 + Math.sin(offset * 3 + index * 0.2) * 0.1 + audioLevel * 0.2})`
              }}
            />
          ))}
        </g>
        
        {/* Central highlight - creates the focal point */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.1 * (1 + audioLevel * 0.3)} 
          fill="url(#glowGradient)" 
          className="animate-pulse-soft"
          filter="url(#strongGlow)"
          opacity={0.95}
        />
        
        {/* 3D highlights that move with forms */}
        {Array.from({length: 3}).map((_, i) => {
          const angle = offset * 2 + (i * Math.PI * 2/3);
          const distance = size * 0.25 * (1 + audioLevel * 0.2);
          return (
            <ellipse
              key={`highlight-${i}`}
              cx={size/2 + Math.cos(angle) * distance} 
              cy={size/2 + Math.sin(angle) * distance}
              rx={size * 0.04}
              ry={size * 0.02}
              fill="rgba(255, 255, 255, 0.5)"
              transform={`rotate(${angle * 180/Math.PI}, ${size/2 + Math.cos(angle) * distance}, ${size/2 + Math.sin(angle) * distance})`}
              className="animate-pulse-soft"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          );
        })}
      </svg>
      
      {/* External glow effect */}
      <div 
        className="absolute inset-0 celestial-glow rounded-full opacity-75"
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

export default CelestialSVG;
