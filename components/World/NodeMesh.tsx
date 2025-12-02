
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { PaperEntity, NodeState, BiomeType, LogicGateType } from '../../types';
import { getTerrainHeight } from '../../utils/terrain';

interface NodeMeshProps {
  data: PaperEntity;
  onClick: (id: string) => void;
  isSelected: boolean;
  isScanned?: boolean;
}

const NodeMesh: React.FC<NodeMeshProps> = ({ data, onClick, isSelected, isScanned }) => {
  const meshRef = useRef<Mesh>(null);
  const scanBoxRef = useRef<Mesh>(null);
  const portalRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);
  const groupRef = useRef<any>(null);

  const hasConnections = data.connections && data.connections.length > 0;
  const isLogicActive = data.logic?.isActive;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      const terrainHeight = getTerrainHeight(data.position[0], data.position[2]);
      
      const isConstructed = data.state === NodeState.CONSTRUCTED;
      const stability = data.construction?.stability || 0;
      const isUnstable = isConstructed && stability < 30;

      const hoverOffset = isUnstable 
        ? Math.sin(time * 20) * 0.05 
        : Math.sin(time + data.position[0]) * 0.2; 
      
      const baseHeight = 1.5;
      const targetY = terrainHeight + baseHeight + hoverOffset;
      
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * delta * 5;
    }

    if (meshRef.current) {
      // Rotation logic: Spin faster if logic is active (Processing)
      const rotSpeed = isLogicActive ? 0.05 : 0.005;
      meshRef.current.rotation.x += rotSpeed;
      meshRef.current.rotation.y += rotSpeed;

      const baseScale = data.state === NodeState.RAW ? 1.0 : 1.2; 
      const selectedScale = isSelected ? baseScale * 1.5 : baseScale;
      const scanScaleFactor = isScanned ? 1 + Math.sin(time * 15) * 0.1 : 1;
      const logicPulse = isLogicActive ? 1 + Math.sin(time * 30) * 0.2 : 1;
      
      const targetScale = selectedScale * scanScaleFactor * logicPulse;
      meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), delta * 10);
    }
    
    if (isScanned && scanBoxRef.current) {
      scanBoxRef.current.rotation.y -= delta * 2;
      scanBoxRef.current.rotation.z += delta;
      const pulse = 1.5 + Math.sin(time * 10) * 0.1;
      scanBoxRef.current.scale.set(pulse, pulse, pulse);
    }

    // Portal Animation
    if (portalRef.current) {
      portalRef.current.rotation.z = time * 0.5;
      portalRef.current.rotation.x = Math.sin(time * 0.2) * 0.2;
    }
  });

  const getColor = () => {
    if (data.logic && data.logic.isActive) return '#ffffff'; // White hot when logic is HIGH
    if (data.state === NodeState.RAW) return '#f59e0b'; 
    
    if (data.state === NodeState.CONSTRUCTED && data.construction) {
      if (data.construction.stability < 30) return '#ef4444'; 
      if (data.construction.stability > 90) return '#fcd34d'; 
      
      // Logic Color Coding
      if (data.logic) {
        switch(data.logic.type) {
            case LogicGateType.NAND: return '#ec4899'; // Pink
            case LogicGateType.AND: return '#3b82f6'; // Blue
            case LogicGateType.OR: return '#22c55e'; // Green
            case LogicGateType.NOT: return '#ef4444'; // Red
            case LogicGateType.CLOCK: return '#eab308'; // Yellow
            default: return '#8b5cf6'; // Purple
        }
      }

      return '#22c55e'; 
    }

    switch (data.biome) {
      case BiomeType.QUANTUM_POLES: return '#06b6d4';
      case BiomeType.SILICON_WASTELAND: return '#ef4444';
      case BiomeType.LIFE_PRIMORDIAL_SOUP: return '#22c55e';
      default: return '#ffffff';
    }
  };

  const getGeometry = () => {
    if (data.state === NodeState.CONSTRUCTED) {
       // Different shapes for gates could go here, keeping simple for now
       return <icosahedronGeometry args={[0.9, 0]} />;
    }

    switch(data.biome) {
      case BiomeType.QUANTUM_POLES: return <octahedronGeometry args={[0.8, 0]} />;
      case BiomeType.SILICON_WASTELAND: return <boxGeometry args={[1, 1, 1]} />;
      case BiomeType.LIFE_PRIMORDIAL_SOUP: return <dodecahedronGeometry args={[0.8, 0]} />;
      default: return <sphereGeometry args={[0.6, 16, 16]} />;
    }
  };

  const isDrained = data.discoveryCount > 10;
  const opacity = isDrained ? 0.4 : 1;
  const color = getColor();
  // Logic Active Boost
  const logicBoost = isLogicActive ? 5 : 0;
  const emissiveBoost = isSelected ? 4 : (isScanned ? 2 : 0);
  const baseEmissive = isDrained ? 0.2 : 0.8;
  const totalEmissive = baseEmissive + emissiveBoost + logicBoost;

  return (
    <group 
      ref={groupRef}
      position={[data.position[0], 0, data.position[2]]} 
      userData={{ isNode: true, nodeId: data.id }} 
    >
      {/* Main Node Mesh */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        castShadow
        receiveShadow
      >
        {getGeometry()}
        
        <meshPhysicalMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={totalEmissive}
          roughness={0.2}
          metalness={0.8}
          transmission={data.state !== NodeState.RAW ? 0.1 : 0} 
          thickness={1}
          transparent={true}
          opacity={opacity}
          wireframe={data.state === NodeState.RAW} 
        />
      </mesh>

      {/* Portal Ring (Only if connections exist) */}
      {hasConnections && (
        <mesh ref={portalRef} rotation={[Math.PI / 2, 0, 0]}>
           <torusGeometry args={[1.5, 0.02, 16, 100]} />
           <meshBasicMaterial color={isLogicActive ? "#ffffff" : "#06b6d4"} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Scanned Effect */}
      {isScanned && (
         <mesh ref={scanBoxRef}>
           <boxGeometry args={[1.2, 1.2, 1.2]} />
           <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.5} />
         </mesh>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
          <ringGeometry args={[1, 1.1, 32]} />
          <meshBasicMaterial color={color} opacity={0.5} transparent side={2} />
        </mesh>
      )}

      <pointLight 
        color={color} 
        distance={5} 
        intensity={isDrained ? 0.5 : 2} 
        decay={2} 
      />

      {/* UI Label */}
      {(hovered || isSelected || data.state === NodeState.CONSTRUCTED) && (
        <Html distanceFactor={12}>
           <div className={`
            flex flex-col items-center
            transition-all duration-200 select-none whitespace-nowrap
          `}>
            {/* Label */}
            <div className={`
               px-3 py-1 text-xs font-mono uppercase tracking-widest backdrop-blur-md border 
               ${isSelected ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200' : 'border-slate-600 bg-slate-900/80 text-slate-300'}
               ${isScanned ? 'animate-pulse text-amber-400 border-amber-500' : ''}
            `}>
               {data.title.substring(0, 20) + '...'}
            </div>

            {/* Structure Type Tag */}
            {data.state === NodeState.CONSTRUCTED && data.construction && (
              <div className="mt-1 flex flex-col items-center gap-1">
                <div className="px-2 py-0.5 text-[10px] font-bold bg-black/80 text-white border border-white/20">
                  [ {data.construction.structureType} ]
                </div>
                
                {/* LOGIC GATE BADGE */}
                {data.logic && (
                  <div className={`px-2 py-0.5 text-[10px] font-bold border ${isLogicActive ? 'bg-white text-black animate-pulse' : 'bg-black text-cyan-400 border-cyan-500'}`}>
                    GATE: {data.logic.type} {data.logic.isActive ? '(1)' : '(0)'}
                  </div>
                )}
              </div>
            )}
          </div>
        </Html>
      )}

      <line>
        <bufferGeometry attach="geometry" setFromPoints={[new Vector3(0, 0, 0), new Vector3(0, -10, 0)]} />
        <lineBasicMaterial attach="material" color={color} transparent opacity={0.2} />
      </line>
    </group>
  );
};

export default NodeMesh;
