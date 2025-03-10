
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CelestialCanvas from '@/components/CelestialCanvas';
import CelestialSVG from '@/components/CelestialSVG';
import AudioVisualizer from '@/components/AudioVisualizer';

const Index = () => {
  const isMobile = useIsMobile();
  const [audioLevel, setAudioLevel] = useState(0);
  const [state, setState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-celestial-purple to-celestial-darkPurple p-4">
      <div 
        className="w-full max-w-4xl mx-auto flex flex-col items-center gap-12 py-12"
        style={{
          background: 'radial-gradient(circle at center, rgba(89,192,232,0.08) 0%, rgba(42,27,95,0) 70%)'
        }}
      >
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Celestial Sphere Visualizer
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Une animation dynamique inspirée de Siri, avec une sphère céleste qui réagit aux entrées audio
          </p>
        </div>
        
        <Tabs defaultValue="canvas" className="w-full max-w-3xl">
          <div className="flex flex-col items-center mb-8">
            <TabsList className="bg-gray-800/50 backdrop-blur-lg">
              <TabsTrigger value="canvas" className="text-white data-[state=active]:bg-gray-700/70">
                Canvas Implementation
              </TabsTrigger>
              <TabsTrigger value="svg" className="text-white data-[state=active]:bg-gray-700/70">
                SVG Implementation
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="canvas" className="w-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-4">
              <div className="relative animate-float">
                <CelestialCanvas 
                  size={isMobile ? 250 : 350} 
                  state={state} 
                  audioLevel={audioLevel}
                />
              </div>
              
              <div className="mt-12">
                <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-center text-white">Canvas HTML Visualization</CardTitle>
                    <CardDescription className="text-center text-gray-300">
                      Animation fluide et détaillée avec rendu dynamique en Canvas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4 text-center">
                      Cette version utilise le Canvas HTML pour des animations ultra-fluides et une manipulation pixel par pixel.
                    </p>
                    <AudioVisualizer 
                      onAudioLevelChange={setAudioLevel} 
                      onStateChange={setState}
                      className="mt-4"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="svg" className="w-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-4">
              <div className="relative animate-float">
                <CelestialSVG 
                  size={isMobile ? 250 : 350} 
                  state={state} 
                  audioLevel={audioLevel}
                />
              </div>
              
              <div className="mt-12">
                <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-center text-white">SVG Visualization</CardTitle>
                    <CardDescription className="text-center text-gray-300">
                      Animation vectorielle réactive et légère en SVG
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4 text-center">
                      Cette implémentation utilise SVG pour des formes vectorielles fluides et des animations précises basées sur des chemins.
                    </p>
                    <AudioVisualizer 
                      onAudioLevelChange={setAudioLevel} 
                      onStateChange={setState}
                      className="mt-4"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="w-full max-w-2xl mt-8">
          <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-white">À propos de cette animation</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Cette sphère céleste présente trois états différents :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-celestial-blue font-semibold">État de repos</span> - L'animation est subtile et douce</li>
                <li><span className="text-celestial-pink font-semibold">Écoute</span> - La sphère réagit à l'entrée du microphone</li>
                <li><span className="text-celestial-teal font-semibold">Lecture</span> - L'animation devient plus dynamique pendant la lecture audio</li>
              </ul>
              <p className="pt-2">
                Utilisez les contrôles audio ci-dessus pour tester les différents états et voir comment l'animation réagit aux niveaux sonores.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
