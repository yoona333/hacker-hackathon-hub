import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CyberGrid() {
  const gridRef = useRef<THREE.LineSegments>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  // Create grid geometry
  const gridGeometry = useMemo(() => {
    const size = 40;
    const divisions = 40;
    const step = size / divisions;
    const halfSize = size / 2;

    const vertices: number[] = [];
    const colors: number[] = [];

    // Amber color RGB
    const amber = { r: 0.96, g: 0.62, b: 0.04 };
    
    for (let i = 0; i <= divisions; i++) {
      const pos = -halfSize + i * step;
      
      // Horizontal lines
      vertices.push(-halfSize, 0, pos, halfSize, 0, pos);
      // Vertical lines
      vertices.push(pos, 0, -halfSize, pos, 0, halfSize);
      
      // Color with distance-based fade
      const distanceFactor = Math.abs(i - divisions / 2) / (divisions / 2);
      const alpha = 0.8 - distanceFactor * 0.6;
      
      for (let j = 0; j < 4; j++) {
        colors.push(amber.r * alpha, amber.g * alpha, amber.b * alpha);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Mouse interaction
  useMemo(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation
  useFrame((state) => {
    if (gridRef.current) {
      // Subtle wave animation
      const positions = gridRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      for (let i = 1; i < positions.length; i += 3) {
        const x = positions[i - 1];
        const z = positions[i + 1];
        const distance = Math.sqrt(x * x + z * z);
        positions[i] = Math.sin(distance * 0.3 - time * 0.5) * 0.15;
      }
      
      gridRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Subtle mouse-based rotation
      gridRef.current.rotation.x = -Math.PI / 2 + mousePosition.current.y * 0.05;
    }
  });

  return (
    <lineSegments ref={gridRef} geometry={gridGeometry} position={[0, -3, 0]}>
      <lineBasicMaterial 
        vertexColors 
        transparent 
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
