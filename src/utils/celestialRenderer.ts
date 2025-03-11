
import { getCelestialConfig } from './celestialConfig';
import { CelestialState } from '@/types/celestial';

/**
 * Renders the celestial orb animation on a canvas
 */
export const renderCelestialCanvas = (
  ctx: CanvasRenderingContext2D,
  time: number,
  size: number,
  state: CelestialState,
  audioLevel: number
) => {
  const config = getCelestialConfig(state, audioLevel);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;
  
  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // Enhanced 3D glass sphere effect - outer glow
  renderOuterGlow(ctx, centerX, centerY, radius, time, audioLevel);
  
  // Glass sphere background with enhanced 3D effect
  renderGlassSphere(ctx, centerX, centerY, radius, config.glassOpacity);
  
  // Add light reflections
  renderLightReflections(ctx, centerX, centerY, radius, time);
  
  // Clip all further drawing to the circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();
  
  // Draw individual organic forms that move with audio
  renderOrganicForms(ctx, centerX, centerY, radius, time, config, audioLevel);
  
  // Add central energy core
  renderEnergyCore(ctx, centerX, centerY, radius, time, state, audioLevel, config.glowIntensity);
  
  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.restore();
  
  // Add outer glass reflections (on top of everything)
  renderGlassReflections(ctx, centerX, centerY, radius, time);
};

/**
 * Renders the outer glow effect
 */
const renderOuterGlow = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  time: number,
  audioLevel: number
) => {
  const glassGlow = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius * 1.5
  );
  
  // Create pulsing outer glow based on audio
  const glowOpacity = 0.2 + Math.sin(time * 1.5) * 0.05 + audioLevel * 0.15;
  glassGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
  glassGlow.addColorStop(0.4, `rgba(255, 255, 255, ${glowOpacity * 0.3})`);
  glassGlow.addColorStop(0.7, `rgba(255, 255, 255, ${glowOpacity * 0.5})`);
  glassGlow.addColorStop(0.9, `rgba(255, 255, 255, ${glowOpacity * 0.1})`);
  glassGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
  ctx.fillStyle = glassGlow;
  ctx.fill();
};

/**
 * Renders the glass sphere effect
 */
const renderGlassSphere = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  glassOpacity: number
) => {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  
  // Create enhanced 3D glass effect with light refraction
  const sphereGradient = ctx.createRadialGradient(
    centerX - radius * 0.3, centerY - radius * 0.3, 0,
    centerX, centerY, radius
  );
  
  // Glass effect with variable opacity based on audio
  const glassBaseOpacity = glassOpacity;
  sphereGradient.addColorStop(0, `rgba(255, 255, 255, ${glassBaseOpacity + 0.3})`);
  sphereGradient.addColorStop(0.2, `rgba(255, 255, 255, ${glassBaseOpacity + 0.15})`);
  sphereGradient.addColorStop(0.5, `rgba(255, 255, 255, ${glassBaseOpacity})`);
  sphereGradient.addColorStop(0.8, `rgba(255, 255, 255, ${glassBaseOpacity - 0.05})`);
  sphereGradient.addColorStop(1, `rgba(255, 255, 255, ${glassBaseOpacity - 0.15})`);
  
  ctx.fillStyle = sphereGradient;
  ctx.globalCompositeOperation = 'screen';
  ctx.fill();
};

/**
 * Renders light reflections on the glass sphere
 */
const renderLightReflections = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  time: number
) => {
  // Main highlight
  ctx.beginPath();
  ctx.ellipse(
    centerX - radius * 0.4, 
    centerY - radius * 0.4, 
    radius * 0.2 * (1 + Math.sin(time) * 0.05), 
    radius * 0.1 * (1 + Math.sin(time * 1.2) * 0.05), 
    Math.PI * 0.25, 
    0, Math.PI * 2
  );
  const highlightGradient = ctx.createRadialGradient(
    centerX - radius * 0.4, centerY - radius * 0.4, 0,
    centerX - radius * 0.4, centerY - radius * 0.4, radius * 0.2
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  ctx.fill();
  
  // Secondary highlight
  ctx.beginPath();
  ctx.ellipse(
    centerX + radius * 0.3, 
    centerY + radius * 0.35, 
    radius * 0.1 * (1 + Math.sin(time * 0.9) * 0.05), 
    radius * 0.05 * (1 + Math.sin(time * 1.1) * 0.05), 
    Math.PI * -0.2, 
    0, Math.PI * 2
  );
  const secondaryHighlight = ctx.createRadialGradient(
    centerX + radius * 0.3, centerY + radius * 0.35, 0,
    centerX + radius * 0.3, centerY + radius * 0.35, radius * 0.1
  );
  secondaryHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  secondaryHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = secondaryHighlight;
  ctx.fill();
};

/**
 * Renders the organic forms inside the sphere
 */
const renderOrganicForms = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  time: number,
  config: any,
  audioLevel: number
) => {
  // Draw individual organic forms that move with audio
  for (let formIndex = 0; formIndex < config.formCount; formIndex++) {
    const color = config.colors[formIndex % config.colors.length];
    
    // Apply enhanced neon glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 25 * config.glowIntensity;
    
    // Create phase offset for each form
    const phaseOffset = formIndex * (Math.PI * 2 / config.formCount);
    
    // Build smooth, fluid shape that oscillates from center
    ctx.beginPath();
    
    // More segments for smoother forms
    const segmentCount = 48; 
    
    // Center anchor point for each form
    for (let j = 0; j <= segmentCount; j++) {
      const segmentAngle = (j / segmentCount) * Math.PI * 2;
      const angle = segmentAngle + time * config.speed * (1 + formIndex * 0.2) + phaseOffset;
      
      // Multi-frequency waves for more fluid, organic shapes
      const freqA = 2 + formIndex * 0.3;
      const freqB = 3 + formIndex * 0.4;
      const freqC = 5 + formIndex * 0.2;
      
      // Audio-reactive pulsation
      const pulseFactor = 0.7 + 
        Math.sin(time * 0.8 + formIndex * 0.7) * 0.2 + 
        (audioLevel * 0.4);
      
      // Create smoother, more fluid distortion with multiple waves
      const distortion = 
        Math.sin(angle * freqA + time * 1.5) * config.amplitude * 0.7 +
        Math.cos(angle * freqB + time * 1.2) * config.amplitude * 0.5 +
        Math.sin(angle * freqC + time * 0.9) * config.amplitude * 0.3;
      
      // Calculate audio-reactive form size
      const expansionFactor = 0.4 + audioLevel * 0.6;
      
      // Add breathing effect for more organic feel
      const breathingEffect = 0.8 + Math.sin(time * 0.6 + formIndex * 0.5) * 0.2;
      
      // Base radius that grows from center with audio
      const baseFormRadius = radius * expansionFactor * pulseFactor * breathingEffect;
      
      // Apply distortion with audio intensity
      const audioDistortion = distortion * radius * 0.35 * config.intensity;
      
      // Final form radius with constraints
      const formRadius = Math.min(baseFormRadius + audioDistortion, radius * 0.95);
      
      // Add 3D-like depth with z-factor
      const zFactor = 0.8 + Math.sin(angle * 3 + time * 0.7 + formIndex) * 0.2;
      
      // Calculate coordinates with 3D perspective
      const x = centerX + Math.cos(angle) * formRadius * zFactor;
      const y = centerY + Math.sin(angle) * formRadius * zFactor;
      
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        // Calculate control points for smooth curves
        const prevAngle = ((j - 1) / segmentCount) * Math.PI * 2 + time * config.speed * (1 + formIndex * 0.2) + phaseOffset;
        
        const prevDistortion = 
          Math.sin(prevAngle * freqA + time * 1.5) * config.amplitude * 0.7 +
          Math.cos(prevAngle * freqB + time * 1.2) * config.amplitude * 0.5 +
          Math.sin(prevAngle * freqC + time * 0.9) * config.amplitude * 0.3;
        
        const prevPulseFactor = 0.7 + 
          Math.sin(time * 0.8 + formIndex * 0.7 - 0.1) * 0.2 + 
          (audioLevel * 0.4);
        
        const prevBreathingEffect = 0.8 + Math.sin(time * 0.6 + formIndex * 0.5 - 0.05) * 0.2;
        const prevBaseFormRadius = radius * expansionFactor * prevPulseFactor * prevBreathingEffect;
        const prevAudioDistortion = prevDistortion * radius * 0.35 * config.intensity;
        const prevFormRadius = Math.min(prevBaseFormRadius + prevAudioDistortion, radius * 0.95);
        
        const prevZFactor = 0.8 + Math.sin(prevAngle * 3 + time * 0.7 + formIndex) * 0.2;
        
        const prevX = centerX + Math.cos(prevAngle) * prevFormRadius * prevZFactor;
        const prevY = centerY + Math.sin(prevAngle) * prevFormRadius * prevZFactor;
        
        // Control point calculation for smooth bezier curves
        const midAngle = (prevAngle + angle) / 2;
        const controlFactor = 1.2 + Math.sin(time + formIndex + j * 0.1) * 0.1;
        const controlDistance = ((prevFormRadius + formRadius) / 2) * controlFactor * prevZFactor;
        
        const cpX = centerX + Math.cos(midAngle) * controlDistance;
        const cpY = centerY + Math.sin(midAngle) * controlDistance;
        
        // Create smooth curves
        ctx.quadraticCurveTo(cpX, cpY, x, y);
      }
    }
    
    ctx.closePath();
    
    // Enhanced neon glow gradients
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    
    // Make colors more vibrant with higher audio levels
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.3, `${color}ee`);
    gradient.addColorStop(0.6, `${color}aa`);
    gradient.addColorStop(1, `${color}55`);
    
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'screen';
    ctx.fill();
  }
};

/**
 * Renders the central energy core
 */
const renderEnergyCore = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  time: number,
  state: CelestialState,
  audioLevel: number,
  glowIntensity: number
) => {
  const coreSize = radius * 0.2 * (1 + audioLevel * 0.5 + Math.sin(time * 2) * 0.1);
  const coreGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, coreSize
  );
  
  // Core color based on state
  const coreColor = state === 'idle' ? '#59c0e8' : 
                   state === 'listening' ? '#e06ebb' : '#42e8d5';
  
  coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  coreGradient.addColorStop(0.5, `${coreColor}ee`);
  coreGradient.addColorStop(0.8, `${coreColor}88`);
  coreGradient.addColorStop(1, `${coreColor}00`);
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
  ctx.fillStyle = coreGradient;
  ctx.shadowColor = coreColor;
  ctx.shadowBlur = 20 * glowIntensity;
  ctx.globalCompositeOperation = 'screen';
  ctx.fill();
};

/**
 * Renders the glass reflections on the outer sphere
 */
const renderGlassReflections = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  time: number
) => {
  // Glass rim highlight
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.97, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time) * 0.1})`;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Glass surface shine that moves
  const shineAngle = time * 0.5;
  ctx.beginPath();
  ctx.ellipse(
    centerX + Math.cos(shineAngle) * radius * 0.5, 
    centerY + Math.sin(shineAngle) * radius * 0.5, 
    radius * 0.1, 
    radius * 0.05,
    shineAngle, 
    0, Math.PI * 2
  );
  const shineGradient = ctx.createRadialGradient(
    centerX + Math.cos(shineAngle) * radius * 0.5,
    centerY + Math.sin(shineAngle) * radius * 0.5,
    0,
    centerX + Math.cos(shineAngle) * radius * 0.5,
    centerY + Math.sin(shineAngle) * radius * 0.5,
    radius * 0.1
  );
  shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shineGradient;
  ctx.globalCompositeOperation = 'lighten';
  ctx.fill();
};
