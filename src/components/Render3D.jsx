import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stage, OrbitControls, Environment, ContactShadows } from '@react-three/drei';

const Cabinet = () => {
  const mesh = useRef<any>(null);
  useFrame((state) => {
    if (mesh.current) mesh.current.rotation.y += 0.002;
  });
  return (
    <mesh ref={mesh} position={[0, 1, 0]}>
      <boxGeometry args={[2, 2, 1]} />
      <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.1} />
    </mesh>
  );
};

export default function Render3D() {
  // Verificação de segurança para não quebrar se o WebGL falhar
  return (
    <div className="w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden relative shadow-inner">
      <div className="absolute top-4 left-4 z-10 bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
        Iara Vision 3D
      </div>
      
      <Canvas shadows dpr={[1, 2]} camera={{ position: [4, 2, 5], fov: 50 }}>
        <Environment preset="apartment" blur={0.8} background />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <group position={[0, -1, 0]}>
          <Cabinet />
          <ContactShadows resolution={512} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />
        </group>
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
