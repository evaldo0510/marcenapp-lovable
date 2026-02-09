import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stage, OrbitControls, Environment, ContactShadows, MeshReflectorMaterial } from '@react-three/drei';

// --- O MÓVEL (Seu Cubo Mágico) ---
const Cabinet = ({ color = '#f59e0b' }) => {
  const mesh = useRef();
  
  // Rotação suave automática (animação sutil)
  useFrame((state) => {
    // mesh.current.rotation.y += 0.002; // Descomente para girar sozinho devagar
  });

  return (
    <mesh ref={mesh} position={[0, 1.1, 0]} castShadow receiveShadow>
      {/* Geometria do Móvel (Largura, Altura, Profundidade) */}
      <boxGeometry args={[2, 2.2, 1]} /> 
      
      {/* Material Físico (PBR) para refletir o ambiente */}
      <meshStandardMaterial 
        color={color} 
        roughness={0.15} // 0 = Espelho, 1 = Fosco (0.15 é tipo laca brilhante)
        metalness={0.1} 
      />
    </mesh>
  );
};

// --- O CHÃO DE SHOWROOM ---
const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <MeshReflectorMaterial
        blur={[300, 100]} // Desfoque do reflexo
        resolution={1024} // Qualidade
        mixBlur={1}
        mixStrength={50} // Força do reflexo
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#1e293b" // Chão escuro (Slate 800)
        metalness={0.6}
      />
    </mesh>
  );
};

export default function Render3D({ textureUrl }) {
  // Configuração de Ambientes (Luzes prontas)
  const [envPreset, setEnvPreset] = useState('apartment'); 

  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl relative group border border-slate-800">
      
      {/* Etiqueta Iara Vision */}
      <div className="absolute top-4 left-4 z-10 bg-orange-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg tracking-widest">
        ✨ Iara 3D Studio
      </div>

      {/* Seletor de Decoração (Aparece ao passar o mouse) */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={() => setEnvPreset('apartment')} className="bg-white/10 hover:bg-white text-white hover:text-black px-3 py-2 rounded-lg text-xs font-bold backdrop-blur border border-white/20 transition-colors">🏠 Casa</button>
        <button onClick={() => setEnvPreset('studio')} className="bg-white/10 hover:bg-white text-white hover:text-black px-3 py-2 rounded-lg text-xs font-bold backdrop-blur border border-white/20 transition-colors">📸 Estúdio</button>
        <button onClick={() => setEnvPreset('city')} className="bg-white/10 hover:bg-white text-white hover:text-black px-3 py-2 rounded-lg text-xs font-bold backdrop-blur border border-white/20 transition-colors">🏙️ Urbano</button>
      </div>
      
      <Canvas shadows dpr={[1, 2]} camera={{ position: [4, 2, 5], fov: 45 }}>
        
        {/* LUZES & AMBIENTE */}
        <Environment preset={envPreset} background blur={0.6} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        {/* CENA */}
        <group position={[0, -1, 0]}>
          <Cabinet color={textureUrl ? '#ffffff' : '#f59e0b'} /> 
          <Floor />
        </group>

        {/* CONTROLES DE CÂMERA */}
        <OrbitControls 
          autoRotate 
          autoRotateSpeed={0.8} 
          enablePan={false} 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2.1} // Trava para não olhar por baixo do chão
        />
      </Canvas>
    </div>
  );
}
