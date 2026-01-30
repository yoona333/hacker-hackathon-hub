import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CyberGrid } from './CyberGrid';
import { DataCubes } from './DataCubes';
import { HexNetwork } from './HexNetwork';
import { ParticleStream } from './ParticleStream';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#f59e0b" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#10b981" />
      
      <CyberGrid />
      <DataCubes />
      <HexNetwork />
      <ParticleStream />
    </>
  );
}

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 8, 25]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
