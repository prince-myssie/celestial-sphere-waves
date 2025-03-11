
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
