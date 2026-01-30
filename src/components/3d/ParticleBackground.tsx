import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField() {
  const ref = useRef<THREE.Points>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  // Generate random star positions
  const particles = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    const colors = new Float32Array(3000 * 3);
    
    for (let i = 0; i < 3000; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      // Neon color palette: purple, blue, cyan, pink
      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        // Purple
        colors[i3] = 0.66;
        colors[i3 + 1] = 0.33;
        colors[i3 + 2] = 0.97;
      } else if (colorChoice < 0.5) {
        // Blue
        colors[i3] = 0.23;
        colors[i3 + 1] = 0.51;
        colors[i3 + 2] = 0.96;
      } else if (colorChoice < 0.75) {
        // Cyan
        colors[i3] = 0.02;
        colors[i3 + 1] = 0.71;
        colors[i3 + 2] = 0.83;
      } else {
        // Pink
        colors[i3] = 0.93;
        colors[i3 + 1] = 0.29;
        colors[i3 + 2] = 0.6;
      }
    }
    
    return { positions, colors };
  }, []);

  // Mouse move handler
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

  // Animation loop
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.05;
      ref.current.rotation.y += delta * 0.08;
      
      // Subtle mouse interaction
      ref.current.rotation.x += mousePosition.current.y * 0.001;
      ref.current.rotation.y += mousePosition.current.x * 0.001;
    }
  });

  return (
    <Points ref={ref} positions={particles.positions} colors={particles.colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mesh2Ref = useRef<THREE.Mesh>(null);
  const mesh3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.5;
      meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.5;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.5;
    }
    
    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.x = Math.sin(t * 0.4 + 1) * 0.5;
      mesh2Ref.current.rotation.z = Math.sin(t * 0.3 + 1) * 0.5;
      mesh2Ref.current.position.y = Math.sin(t * 0.4 + 2) * 0.3;
    }
    
    if (mesh3Ref.current) {
      mesh3Ref.current.rotation.y = Math.sin(t * 0.5 + 2) * 0.5;
      mesh3Ref.current.rotation.z = Math.sin(t * 0.2 + 2) * 0.5;
      mesh3Ref.current.position.y = Math.sin(t * 0.6 + 1) * 0.4;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[-4, 1, -3]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.6} />
      </mesh>
      
      <mesh ref={mesh2Ref} position={[4, -1, -4]}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.6} />
      </mesh>
      
      <mesh ref={mesh3Ref} position={[0, 2, -5]}>
        <tetrahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.6} />
      </mesh>
    </>
  );
}

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 5, 15]} />
        <ambientLight intensity={0.5} />
        <StarField />
        <FloatingGeometry />
      </Canvas>
    </div>
  );
}
