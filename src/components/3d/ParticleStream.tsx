import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function ParticleStream() {
  const ref = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    // Reduced particle count for better performance (from 800 to 300)
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    
    // Amber and emerald colors
    const amber = { r: 0.96, g: 0.62, b: 0.04 };
    const emerald = { r: 0.06, g: 0.73, b: 0.51 };
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribute in a cylinder shape
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3 + 0.5;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 15;
      positions[i3 + 2] = Math.sin(angle) * radius - 8;
      
      // Random color between amber and emerald
      const colorMix = Math.random();
      colors[i3] = amber.r * (1 - colorMix) + emerald.r * colorMix;
      colors[i3 + 1] = amber.g * (1 - colorMix) + emerald.g * colorMix;
      colors[i3 + 2] = amber.b * (1 - colorMix) + emerald.b * colorMix;
      
      speeds[i] = Math.random() * 0.02 + 0.01;
    }
    
    return { positions, colors, speeds };
  }, []);

  useFrame(() => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        const i3 = i * 3;
        
        // Move particles upward
        positions[i3 + 1] += particles.speeds[i];
        
        // Reset particles that go too high
        if (positions[i3 + 1] > 8) {
          positions[i3 + 1] = -8;
        }
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={particles.positions} colors={particles.colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}
