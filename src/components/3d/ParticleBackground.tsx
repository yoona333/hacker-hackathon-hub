import { Suspense, lazy, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { usePerformance } from '@/hooks/usePerformance';
import { CyberGrid } from './CyberGrid';

// Lazy load heavy 3D components
const DataCubes = lazy(() => import('./DataCubes').then(m => ({ default: m.DataCubes })));
const HexNetwork = lazy(() => import('./HexNetwork').then(m => ({ default: m.HexNetwork })));
const ParticleStream = lazy(() => import('./ParticleStream').then(m => ({ default: m.ParticleStream })));

function Scene({ enableAll }: { enableAll: boolean }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#f59e0b" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#10b981" />
      
      {/* Always show grid (lightweight) */}
      <CyberGrid />
      
      {/* Conditionally load heavy components */}
      {enableAll && (
        <Suspense fallback={null}>
          <DataCubes />
          <HexNetwork />
          <ParticleStream />
        </Suspense>
      )}
    </>
  );
}

export function ParticleBackground() {
  const { enable3D, isLowPerformance } = usePerformance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay 3D rendering slightly to prioritize initial page load
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Fallback to static gradient for very low performance devices
  if (isLowPerformance && !enable3D) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-background/95">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      {mounted ? (
        <Canvas
          camera={{ position: [0, 2, 8], fov: 50 }}
          dpr={isLowPerformance ? [1, 1] : [1, 1.5]} // Lower DPR on low performance
          gl={{ 
            antialias: !isLowPerformance, // Disable antialiasing on low performance
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false, // Disable stencil buffer for performance
            depth: true,
          }}
          performance={{ min: 0.5 }} // Lower FPS threshold
        >
          <color attach="background" args={['#0a0a0f']} />
          <fog attach="fog" args={['#0a0a0f', 8, 25]} />
          <Suspense fallback={null}>
            <Scene enableAll={enable3D} />
          </Suspense>
        </Canvas>
      ) : (
        // Show static gradient while loading
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" />
        </div>
      )}
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
