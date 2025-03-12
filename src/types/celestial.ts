
export type CelestialState = 'idle' | 'listening' | 'speaking' | 'thinking' | 'initializing' | 'connecting' | 'disconnected';

export interface CelestialCanvasProps {
  size?: number;
  state: CelestialState;
  audioLevel?: number;
  className?: string;
}

export interface CelestialConfig {
  amplitude: number;
  speed: number;
  intensity: number;
  colors: string[];
  formCount: number;
  glowIntensity: number;
  glassOpacity: number;
}
