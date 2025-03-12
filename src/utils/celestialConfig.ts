
import { CelestialState } from '@/types/celestial';

/**
 * Get wave properties configuration based on state and audio level
 */
export const getCelestialConfig = (state: CelestialState, audioLevel: number) => {
  const baseAmplitude = 0.35;
  const baseSpeed = 0.003;
  const baseIntensity = 0.75;
  
  switch (state) {
    case 'listening':
      return {
        amplitude: baseAmplitude + audioLevel * 0.4,
        speed: baseSpeed * 1.8,
        intensity: baseIntensity + audioLevel * 0.8,
        colors: ['#59c0e8', '#e06ebb', '#42e8d5', '#e06ebb', '#59c0e8'],
        formCount: 5,
        glowIntensity: 1.5 + audioLevel * 0.8,
        glassOpacity: 0.3 + audioLevel * 0.2
      };
    case 'speaking':
      return {
        amplitude: baseAmplitude + audioLevel * 0.5,
        speed: baseSpeed * 2.8,
        intensity: baseIntensity + audioLevel * 0.9,
        colors: ['#e06ebb', '#42e8d5', '#59c0e8', '#42e8d5', '#e06ebb'],
        formCount: 5,
        glowIntensity: 1.8 + audioLevel * 0.9,
        glassOpacity: 0.4 + audioLevel * 0.3
      };
    case 'thinking':
      return {
        amplitude: baseAmplitude + audioLevel * 0.3,
        speed: baseSpeed * 2.2,
        intensity: baseIntensity + audioLevel * 0.6,
        colors: ['#ffcc00', '#ff9900', '#ff6600', '#ff9900', '#ffcc00'],
        formCount: 5,
        glowIntensity: 1.6 + audioLevel * 0.7,
        glassOpacity: 0.35 + audioLevel * 0.25
      };
    case 'initializing':
      return {
        amplitude: baseAmplitude * 0.8,
        speed: baseSpeed * 1.5,
        intensity: baseIntensity * 0.7,
        colors: ['#00ffff', '#00ccff', '#0099ff', '#00ccff', '#00ffff'],
        formCount: 5,
        glowIntensity: 1.4 + Math.sin(Date.now() * 0.005) * 0.4,
        glassOpacity: 0.3 + Math.sin(Date.now() * 0.003) * 0.15
      };
    case 'connecting':
      return {
        amplitude: baseAmplitude * 0.6,
        speed: baseSpeed * 1.2,
        intensity: baseIntensity * 0.6,
        colors: ['#00ff99', '#00cc99', '#009999', '#00cc99', '#00ff99'],
        formCount: 5,
        glowIntensity: 1.2 + Math.sin(Date.now() * 0.003) * 0.3,
        glassOpacity: 0.25 + Math.sin(Date.now() * 0.002) * 0.1
      };
    case 'disconnected':
      return {
        amplitude: baseAmplitude * 0.4,
        speed: baseSpeed * 0.6,
        intensity: baseIntensity * 0.4,
        colors: ['#ff3333', '#cc3333', '#993333', '#cc3333', '#ff3333'],
        formCount: 5,
        glowIntensity: 1.0 + Math.sin(Date.now() * 0.002) * 0.2,
        glassOpacity: 0.2 + Math.sin(Date.now() * 0.001) * 0.05
      };
    default: // idle
      return {
        amplitude: baseAmplitude,
        speed: baseSpeed,
        intensity: baseIntensity,
        colors: ['#42e8d5', '#59c0e8', '#e06ebb', '#59c0e8', '#42e8d5'],
        formCount: 5,
        glowIntensity: 1.2,
        glassOpacity: 0.25
      };
  }
};
