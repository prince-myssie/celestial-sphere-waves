
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
        colors: ['#59c0e8', '#e06ebb', '#42e8d5', '#59c0e8', '#e06ebb'],
        glassOpacity: 0.75
      },
      listening: {
        formCount: 5,
        scale: 0.5 + audioLevel * 0.15,
        variation: 0.1 + audioLevel * 0.1,
        colors: ['#e06ebb', '#59c0e8', '#42e8d5', '#e06ebb', '#59c0e8'],
        glassOpacity: 0.8 + audioLevel * 0.15
      },
      speaking: {
        formCount: 5,
        scale: 0.5 + audioLevel * 0.2,
        variation: 0.15 + audioLevel * 0.15,
        colors: ['#42e8d5', '#e06ebb', '#59c0e8', '#42e8d5', '#e06ebb'],
        glassOpacity: 0.85 + audioLevel * 0.2
      }
    };
    
    const { formCount, scale, variation, colors, glassOpacity } = config[state];
    const center = size / 2;
    const maxRadius = size * scale;
    
    const forms = [];
    
    // Generate the 5 interconnected circular forms
    for (let i = 0; i < formCount; i++) {
      // Center anchor point
      const anchorX = center;
      const anchorY = center;
      
      // Each form has a unique phase offset for varied movement
      const phaseOffset = (i / formCount) * Math.PI * 2;
      
      // Create smooth organic form with bezier curves
      const points = [];
      const pointCount = 36; // Higher point count for smoother forms
      
      // Create a path that undulates from the center
      for (let j = 0; j <= pointCount; j++) {
        const angle = (j / pointCount) * Math.PI * 2 + offset * (1 + i * 0.2) + phaseOffset;
        
        // Use multiple frequencies for more organic shapes
        const freq1 = 1 + i * 0.3;
        const freq2 = 2 + i * 0.5;
        const freq3 = 4 + i * 0.2;
        
        // Audio-reactive pulsation
        const pulseFactor = 0.6 + 
          Math.sin(offset * 1.2 + i * 0.8) * 0.15 + 
          audioLevel * 0.35;
        
        // Smoother organic distortion with multiple sine waves
        const distortion = 
          Math.sin(angle * freq1 + offset * 2) * variation * 0.7 +
          Math.cos(angle * freq2 + offset * 1.5) * variation * 0.5 +
          Math.sin(angle * freq3 + offset * 2.5) * variation * 0.3;
        
        // Distance from center varies with audio
        const expansionFactor = 0.3 + audioLevel * 0.7;
        
        // 3D-like depth effect
        const zDepthFactor = 0.8 + Math.sin(angle * 2 + offset * 1.2 + i * 0.5) * 0.2;
        
        // Calculate form radius with audio reactivity
        const baseRadius = maxRadius * expansionFactor * pulseFactor * zDepthFactor;
        const audioReactiveRadius = baseRadius + (distortion * maxRadius * (0.4 + audioLevel * 0.6));
        
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
            Math.sin(prevAngle * freq1 + offset * 2) * variation * 0.7 +
            Math.cos(prevAngle * freq2 + offset * 1.5) * variation * 0.5 +
            Math.sin(prevAngle * freq3 + offset * 2.5) * variation * 0.3;
          
          const prevPulseFactor = 0.6 + 
            Math.sin(offset * 1.2 + i * 0.8 - 0.1) * 0.15 + 
            audioLevel * 0.35;
          
          const prevZDepthFactor = 0.8 + Math.sin(prevAngle * 2 + offset * 1.2 + i * 0.5) * 0.2;
          const prevExpansionFactor = 0.3 + audioLevel * 0.7;
          
          const prevBaseRadius = maxRadius * prevExpansionFactor * prevPulseFactor * prevZDepthFactor;
          const prevAudioReactiveRadius = prevBaseRadius + (prevDistortion * maxRadius * (0.4 + audioLevel * 0.6));
          const prevFormRadius = Math.min(prevAudioReactiveRadius, maxRadius * 0.95);
          
          const prevX = anchorX + Math.cos(prevAngle) * prevFormRadius;
          const prevY = anchorY + Math.sin(prevAngle) * prevFormRadius;
          
          // Calculate control points for smoother curves
          const midAngle = (prevAngle + angle) / 2;
          const controlFactor = 1.2 + Math.sin(offset * 2 + i * 0.7) * 0.2;
          const controlRadius = ((prevFormRadius + formRadius) / 2) * controlFactor * (1 + audioLevel * 0.2);
          
          const cpX = anchorX + Math.cos(midAngle) * controlRadius;
          const cpY = anchorY + Math.sin(midAngle) * controlRadius;
          
          // Use quadratic bezier for smoother forms
          points.push(`Q${cpX},${cpY} ${x},${y}`);
        }
      }
      
      points.push("Z");
      
      // Create multiple layers for each form with depth effect
      for (let layer = 0; layer < 3; layer++) {
        const colorIndex = (i + layer) % colors.length;
        const opacityBase = 0.9 - (layer * 0.25); // Inner layers more opaque
        
        // Different phases for each layer
        const layerPhaseOffset = phaseOffset + (layer * 0.4);
        const layerPoints = [];
        
        for (let j = 0; j <= pointCount; j++) {
          const angle = (j / pointCount) * Math.PI * 2 + offset * (1 + (i + layer) * 0.15) + layerPhaseOffset;
          
          // Varied frequencies per layer
          const lFreq1 = 1 + (i + layer) * 0.25;
          const lFreq2 = 2 + (i + layer) * 0.4;
          const lFreq3 = 4 + (i + layer) * 0.15;
          
          // Each layer has unique pulsation
          const layerPulseFactor = 0.6 + 
            Math.sin(offset * 1.2 + (i + layer) * 0.6) * 0.15 + 
            audioLevel * (0.3 - layer * 0.05);
          
          // Layer-specific distortion
          const layerDistortion = 
            Math.sin(angle * lFreq1 + offset * 2.3 + layer) * variation * (0.7 - layer * 0.15) +
            Math.cos(angle * lFreq2 + offset * 1.7 + layer) * variation * (0.5 - layer * 0.1) +
            Math.sin(angle * lFreq3 + offset * 3 + layer) * variation * (0.3 - layer * 0.05);
          
          // Layer expansion factor based on depth
          const layerExpansionFactor = (0.35 - layer * 0.05) + (audioLevel * (0.65 - layer * 0.1));
          
          // 3D depth effect varies per layer
          const layerZDepthFactor = 0.85 + Math.sin(angle * 2 + offset * 1.2 + (i + layer) * 0.4) * (0.15 - layer * 0.05);
          
          // Calculate radius with layered effects
          const layerBaseRadius = maxRadius * layerExpansionFactor * layerPulseFactor * layerZDepthFactor * (1 - layer * 0.15);
          const layerAudioReactiveRadius = layerBaseRadius + (layerDistortion * maxRadius * (0.35 + audioLevel * (0.65 - layer * 0.15)));
          
          // Ensure radius stays within bounds
          const layerRadius = Math.min(layerAudioReactiveRadius, maxRadius * (0.95 - layer * 0.1));
          
          // Calculate coordinate with 3D perspective
          const x = anchorX + Math.cos(angle) * layerRadius;
          const y = anchorY + Math.sin(angle) * layerRadius;
          
          if (j === 0) {
            layerPoints.push(`M${x},${y}`);
          } else {
            // Calculate previous point
            const prevAngle = ((j - 1) / pointCount) * Math.PI * 2 + offset * (1 + (i + layer) * 0.15) + layerPhaseOffset;
            
            const prevLayerDistortion = 
              Math.sin(prevAngle * lFreq1 + offset * 2.3 + layer) * variation * (0.7 - layer * 0.15) +
              Math.cos(prevAngle * lFreq2 + offset * 1.7 + layer) * variation * (0.5 - layer * 0.1) +
              Math.sin(prevAngle * lFreq3 + offset * 3 + layer) * variation * (0.3 - layer * 0.05);
            
            const prevLayerPulseFactor = 0.6 + 
              Math.sin(offset * 1.2 + (i + layer) * 0.6 - 0.1) * 0.15 + 
              audioLevel * (0.3 - layer * 0.05);
            
            const prevLayerZDepthFactor = 0.85 + Math.sin(prevAngle * 2 + offset * 1.2 + (i + layer) * 0.4) * (0.15 - layer * 0.05);
            const prevLayerExpansionFactor = (0.35 - layer * 0.05) + (audioLevel * (0.65 - layer * 0.1));
            
            const prevLayerBaseRadius = maxRadius * prevLayerExpansionFactor * prevLayerPulseFactor * prevLayerZDepthFactor * (1 - layer * 0.15);
            const prevLayerAudioReactiveRadius = prevLayerBaseRadius + 
              (prevLayerDistortion * maxRadius * (0.35 + audioLevel * (0.65 - layer * 0.15)));
            
            const prevLayerRadius = Math.min(prevLayerAudioReactiveRadius, maxRadius * (0.95 - layer * 0.1));
            
            const prevX = anchorX + Math.cos(prevAngle) * prevLayerRadius;
            const prevY = anchorY + Math.sin(prevAngle) * prevLayerRadius;
            
            // Control point for smooth curves
            const midAngle = (prevAngle + angle) / 2;
            const layerControlFactor = 1.2 + Math.sin(offset * 2.2 + (i + layer) * 0.6) * 0.2;
            const controlRadius = ((prevLayerRadius + layerRadius) / 2) * layerControlFactor;
            
            const cpX = anchorX + Math.cos(midAngle) * controlRadius;
            const cpY = anchorY + Math.sin(midAngle) * controlRadius;
            
            // Quadratic bezier for smooth forms
            layerPoints.push(`Q${cpX},${cpY} ${x},${y}`);
          }
        }
        
        layerPoints.push("Z");
        
        // Add form with neon glow effect
        forms.push({
          path: layerPoints.join(' '),
          color: colors[colorIndex],
          opacity: (opacityBase + audioLevel * 0.2) - (Math.sin(offset * 1.5 + layer) * 0.1),
          animationDelay: `${(i + layer) * 0.15}s`,
          index: i * 10 + layer,
          filter: layer === 0 ? "url(#strongGlow)" : "url(#neonGlow)",
          transform: `scale(${1 + Math.sin(offset + i + layer * 0.3) * 0.05 + audioLevel * (0.15 - layer * 0.05)})`
        });
      }
    }
    
    // Add central energy core
    const centralPoints = [];
    const centralPointCount = 36;
    const centralRadius = maxRadius * 0.25 * (1 + audioLevel * 0.4);
    
    for (let j = 0; j <= centralPointCount; j++) {
      const angle = (j / centralPointCount) * Math.PI * 2 + offset * 1.8;
      
      // Slight variation for organic feel
      const centralVariation = variation * 0.4;
      const centralDistortion = Math.sin(angle * 5 + offset * 3) * centralVariation;
      
      // Audio-reactive radius
      const centralFormRadius = centralRadius * (1 + centralDistortion + audioLevel * 0.3);
      
      // Calculate position with subtle 3D effect
      const x = center + Math.cos(angle) * centralFormRadius;
      const y = center + Math.sin(angle) * centralFormRadius;
      
      if (j === 0) {
        centralPoints.push(`M${x},${y}`);
      } else {
        // Calculate control points
        const prevAngle = ((j - 1) / centralPointCount) * Math.PI * 2 + offset * 1.8;
        const prevCentralDistortion = Math.sin(prevAngle * 5 + offset * 3) * centralVariation;
        const prevCentralFormRadius = centralRadius * (1 + prevCentralDistortion + audioLevel * 0.3);
        
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
    
    // Color based on state
    const centralColor = state === 'idle' ? '#59c0e8' : 
                        state === 'listening' ? '#e06ebb' : '#42e8d5';
    
    // Add central core with strong glow
    forms.push({
      path: centralPoints.join(' '),
      color: centralColor,
      opacity: 0.95,
      animationDelay: '0s',
      index: 999, // Highest z-index
      filter: "url(#centralGlow)",
      transform: `scale(${1 + Math.sin(offset * 3) * 0.1 + audioLevel * 0.2})`
    });
    
    return {
      forms,
      glassOpacity
    };
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + 0.03); // Slightly faster animation
    }, 40); // Smoother animation with more frequent updates
    
    return () => clearInterval(interval);
  }, []);
  
  const { forms, glassOpacity } = getOrbForms(state, audioLevel);
  
  return (
    <div className={cn("relative", className)}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="rounded-full"
      >
        {/* Enhanced glass effect gradients and filters */}
        <defs>
          {/* Improved glass sphere gradient */}
          <radialGradient id="sphereGradient" cx="40%" cy="40%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
            <stop offset="40%" stopColor={`rgba(255, 255, 255, ${glassOpacity * 0.6})`} />
            <stop offset="70%" stopColor={`rgba(255, 255, 255, ${glassOpacity * 0.3})`} />
            <stop offset="100%" stopColor={`rgba(255, 255, 255, ${glassOpacity * 0.1})`} />
          </radialGradient>
          
          {/* Enhanced outer glow */}
          <radialGradient id="outerGlowGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="80%" stopColor={`rgba(255, 255, 255, ${0.3 + audioLevel * 0.2})`} />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          
          {/* Central glow gradient */}
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="50%" stopColor={`rgba(255, 255, 255, ${0.7 + audioLevel * 0.3})`} />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          
          {/* Enhanced neon glow filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feFlood floodColor="#fff" floodOpacity="0.5" result="glow" />
            <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
            <feBlend in="SourceGraphic" in2="softGlow" mode="screen" />
          </filter>
          
          {/* Stronger neon glow for primary forms */}
          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="#fff" floodOpacity="0.8" result="glow" />
            <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
            <feBlend in="SourceGraphic" in2="softGlow" mode="screen" />
          </filter>
          
          {/* Extra intense glow for central core */}
          <filter id="centralGlow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feFlood floodColor="#fff" floodOpacity="0.9" result="glow" />
            <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
            <feBlend in="SourceGraphic" in2="softGlow" mode="screen" />
          </filter>
          
          {/* Create gradients for each organic form */}
          {forms.map((form, index) => (
            <radialGradient 
              key={`grad-${index}`}
              id={`formGradient-${index}`} 
              cx="50%" 
              cy="50%" 
              r="80%" 
              fx="40%" 
              fy="40%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.95" />
              <stop offset="30%" stopColor={form.color} stopOpacity="0.9" />
              <stop offset="70%" stopColor={form.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={form.color} stopOpacity="0.2" />
            </radialGradient>
          ))}
        </defs>
        
        {/* Outer glow effect */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.47} 
          fill="url(#outerGlowGradient)" 
          className="animate-pulse-soft"
          style={{ animationDuration: '4s' }}
        />
        
        {/* Glass sphere background */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.42} 
          fill="url(#sphereGradient)" 
          opacity={glassOpacity}
          className="animate-pulse-soft"
          style={{ animationDuration: '6s' }}
        />
        
        {/* Glass sphere border highlight */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.419} 
          fill="none" 
          stroke={`rgba(255, 255, 255, ${0.5 + audioLevel * 0.3})`}
          strokeWidth="1"
        />
        
        {/* 3D glass highlight */}
        <ellipse
          cx={size * 0.35}
          cy={size * 0.35}
          rx={size * 0.15}
          ry={size * 0.08}
          fill="rgba(255, 255, 255, 0.25)"
          opacity={0.6 + Math.sin(offset) * 0.1}
          style={{ transform: `rotate(-30deg)`, transformOrigin: `${size * 0.35}px ${size * 0.35}px` }}
        />
        
        {/* Render organic forms */}
        <g>
          {forms.map((form, index) => (
            <path
              key={index}
              d={form.path}
              fill={`url(#formGradient-${index})`}
              opacity={form.opacity}
              filter={form.filter}
              style={{ 
                animationDelay: form.animationDelay,
                transformOrigin: 'center',
                transformBox: 'fill-box',
                transform: form.transform,
                transition: 'transform 0.3s ease-out'
              }}
              className="animate-pulse-slow"
            />
          ))}
        </g>
        
        {/* Glass reflections */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.42} 
          fill="none" 
          stroke={`rgba(255, 255, 255, ${0.2 + audioLevel * 0.15})`}
          strokeWidth="2" 
          filter="url(#neonGlow)"
          className="animate-pulse-soft"
        />
        
        {/* Moving glass shine */}
        <ellipse
          cx={size/2 + Math.cos(offset * 0.5) * size * 0.25}
          cy={size/2 + Math.sin(offset * 0.5) * size * 0.25}
          rx={size * 0.08}
          ry={size * 0.04}
          fill="rgba(255, 255, 255, 0.3)"
          opacity={0.7 + Math.sin(offset * 2) * 0.2}
          transform={`rotate(${offset * 30}, ${size/2 + Math.cos(offset) * size * 0.2}, ${size/2 + Math.sin(offset) * size * 0.2})`}
        />
      </svg>
      
      {/* Enhanced external glow effect */}
      <div 
        className="absolute inset-0 celestial-glow rounded-full opacity-90"
        style={{
          background: state === 'idle' 
            ? 'radial-gradient(circle, rgba(89,192,232,0.45) 0%, rgba(89,192,232,0) 70%)' 
            : state === 'listening'
            ? 'radial-gradient(circle, rgba(224,110,187,0.55) 0%, rgba(224,110,187,0) 70%)'
            : 'radial-gradient(circle, rgba(66,232,213,0.55) 0%, rgba(66,232,213,0) 70%)'
        }}
      />
    </div>
  );
};

export default CelestialSVG;
