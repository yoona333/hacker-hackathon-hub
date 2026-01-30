import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface HexNodeProps {
  position: [number, number, number];
  scale: number;
  pulseOffset: number;
}

function HexNode({ position, scale, pulseOffset }: HexNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 2 + pulseOffset) * 0.3 + 0.7;
      materialRef.current.opacity = pulse * 0.6;
    }
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.002;
    }
  });

  const hexGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = scale;
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  }, [scale]);

  const edgePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const sides = 6;
    const radius = scale;
    
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      points.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ]);
    }
    
    return points;
  }, [scale]);

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={hexGeometry}>
        <meshBasicMaterial 
          ref={materialRef}
          color="#f59e0b" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Line
        points={edgePoints}
        color="#f59e0b"
        lineWidth={1}
        transparent
        opacity={0.8}
      />
    </group>
  );
}

function ConnectionLine({ start, end, pulseOffset }: { 
  start: [number, number, number]; 
  end: [number, number, number];
  pulseOffset: number;
}) {
  const opacityRef = useRef(0.5);
  
  useFrame((state) => {
    const pulse = Math.sin(state.clock.getElapsedTime() * 3 + pulseOffset) * 0.3 + 0.5;
    opacityRef.current = pulse;
  });

  return (
    <Line
      points={[start, end]}
      color="#10b981"
      lineWidth={1}
      transparent
      opacity={0.5}
    />
  );
}

export function HexNetwork() {
  const nodes = useMemo(() => [
    { position: [0, 0, -6] as [number, number, number], scale: 0.4, pulseOffset: 0 },
    { position: [-1.5, 1.2, -6] as [number, number, number], scale: 0.3, pulseOffset: 1 },
    { position: [1.5, 1.2, -6] as [number, number, number], scale: 0.3, pulseOffset: 2 },
    { position: [-1.5, -1.2, -6] as [number, number, number], scale: 0.3, pulseOffset: 3 },
    { position: [1.5, -1.2, -6] as [number, number, number], scale: 0.3, pulseOffset: 4 },
    { position: [0, 2.4, -6] as [number, number, number], scale: 0.25, pulseOffset: 5 },
    { position: [0, -2.4, -6] as [number, number, number], scale: 0.25, pulseOffset: 6 },
  ], []);

  const connections = useMemo(() => [
    { start: [0, 0, -6] as [number, number, number], end: [-1.5, 1.2, -6] as [number, number, number], pulseOffset: 0.5 },
    { start: [0, 0, -6] as [number, number, number], end: [1.5, 1.2, -6] as [number, number, number], pulseOffset: 1 },
    { start: [0, 0, -6] as [number, number, number], end: [-1.5, -1.2, -6] as [number, number, number], pulseOffset: 1.5 },
    { start: [0, 0, -6] as [number, number, number], end: [1.5, -1.2, -6] as [number, number, number], pulseOffset: 2 },
    { start: [-1.5, 1.2, -6] as [number, number, number], end: [0, 2.4, -6] as [number, number, number], pulseOffset: 2.5 },
    { start: [1.5, 1.2, -6] as [number, number, number], end: [0, 2.4, -6] as [number, number, number], pulseOffset: 3 },
    { start: [-1.5, -1.2, -6] as [number, number, number], end: [0, -2.4, -6] as [number, number, number], pulseOffset: 3.5 },
    { start: [1.5, -1.2, -6] as [number, number, number], end: [0, -2.4, -6] as [number, number, number], pulseOffset: 4 },
  ], []);

  return (
    <group position={[0, 1, 0]}>
      {connections.map((conn, index) => (
        <ConnectionLine key={`conn-${index}`} {...conn} />
      ))}
      {nodes.map((node, index) => (
        <HexNode key={`node-${index}`} {...node} />
      ))}
    </group>
  );
}
