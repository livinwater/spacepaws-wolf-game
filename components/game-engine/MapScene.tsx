'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '@/lib/game/state';

function WolfMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5]} />
      <meshStandardMaterial color="grey" />
    </mesh>
  );
}

export default function MapScene() {
  const currentStage = useGameStore((state) => state.currentStage);
  
  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 5, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={false} />
        
        {/* Path visualization */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        
        {/* Wolf position marker */}
        <WolfMarker position={[currentStage * 3 - 5, 0.5, 0]} />
      </Canvas>
    </div>
  );
}
