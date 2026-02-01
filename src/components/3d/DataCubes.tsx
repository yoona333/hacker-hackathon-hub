import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface DataCubeProps {
  position: [number, number, number];
  size: number;
  color: string;
  rotationSpeed: number;
}

function DataCube({ position, size, color, rotationSpeed }: DataCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed * 0.01;
      meshRef.current.rotation.y += rotationSpeed * 0.015;
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.x = meshRef.current?.rotation.x || 0;
      edgesRef.current.rotation.y = meshRef.current?.rotation.y || 0;
    }
  });

  const geometry = useMemo(() => new THREE.BoxGeometry(size, size, size), [size]);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position}>
        {/* Inner glow cube */}
        <mesh ref={meshRef} geometry={geometry}>
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Wireframe edges */}
        <lineSegments ref={edgesRef} geometry={edgesGeometry}>
          <lineBasicMaterial 
            color={color} 
            transparent 
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      </group>
    </Float>
  );
}

export function DataCubes() {
  // Reduced cube count from 6 to 4 for better performance
  const cubes = useMemo(() => [
    { position: [-4, 2, -5] as [number, number, number], size: 0.8, color: '#f59e0b', rotationSpeed: 1 },
    { position: [4, 1, -6] as [number, number, number], size: 0.6, color: '#10b981', rotationSpeed: 1.5 },
    { position: [0, 3, -8] as [number, number, number], size: 1, color: '#f59e0b', rotationSpeed: 0.8 },
    { position: [-3, -1, -4] as [number, number, number], size: 0.5, color: '#10b981', rotationSpeed: 1.2 },
  ], []);

  return (
    <group>
      {cubes.map((cube, index) => (
        <DataCube key={index} {...cube} />
      ))}
    </group>
  );
}
