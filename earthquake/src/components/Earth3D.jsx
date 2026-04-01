import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Earth3D = () => {
  const earthRef = useRef(null);
  const ringsRef = useRef(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.1;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z = time * 0.2;
    }
  });

  return (
    <group>
      <Sphere ref={earthRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#1e40af"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
        />
      </Sphere>

      <group ref={ringsRef}>
        {[1, 1.5, 2, 2.5].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius * 1.5, 0.02, 16, 100]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.3 - i * 0.05}
            />
          </mesh>
        ))}
      </group>

      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <ambientLight intensity={0.3} />
    </group>
  );
};

export default Earth3D;
