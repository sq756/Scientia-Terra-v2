
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { PaperEntity, SignalPacket } from '../../types';

interface TensorNetworkProps {
  nodes: PaperEntity[];
  signals: SignalPacket[];
  selectedNodeId: string | null;
}

const TensorNetwork: React.FC<TensorNetworkProps> = ({ nodes, signals, selectedNodeId }) => {
  // Create a map for fast position lookup
  const nodeMap = useMemo(() => {
    return nodes.reduce((acc, node) => {
      acc[node.id] = new THREE.Vector3(...node.position);
      return acc;
    }, {} as Record<string, THREE.Vector3>);
  }, [nodes]);

  // Generate static connection lines (The hardware)
  const connections = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3; id: string; active: boolean }[] = [];
    
    nodes.forEach(node => {
      if (node.connections) {
        node.connections.forEach(targetId => {
          const targetPos = nodeMap[targetId];
          if (targetPos) {
             const isRelatedToSelected = selectedNodeId === node.id || selectedNodeId === targetId;
             lines.push({
               id: `${node.id}-${targetId}`,
               start: new THREE.Vector3(...node.position),
               end: targetPos,
               active: isRelatedToSelected
             });
          }
        });
      }
    });
    return lines;
  }, [nodes, nodeMap, selectedNodeId]);

  return (
    <group>
      {/* 1. Static Wires (Tensors) */}
      {connections.map((conn) => (
        <TensorWire 
          key={conn.id} 
          start={conn.start} 
          end={conn.end} 
          isActive={conn.active}
        />
      ))}

      {/* 2. Dynamic Signals (Data Packets) */}
      {signals.map((sig) => (
        <DataPacket 
          key={sig.id}
          start={nodeMap[sig.sourceId]}
          end={nodeMap[sig.targetId]}
          progress={sig.progress}
        />
      ))}
    </group>
  );
};

const TensorWire: React.FC<{ start: THREE.Vector3; end: THREE.Vector3; isActive: boolean }> = ({ start, end, isActive }) => {
  const mid = useMemo(() => {
    const m = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    m.y += 2; 
    return m;
  }, [start, end]);

  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={mid}
      color={isActive ? "#fbbf24" : "#06b6d4"} 
      lineWidth={isActive ? 2 : 1}
      transparent
      opacity={isActive ? 0.8 : 0.15}
      dashed={!isActive}
      dashScale={5}
      gapSize={3}
    />
  );
};

const DataPacket: React.FC<{ start: THREE.Vector3; end: THREE.Vector3; progress: number }> = ({ start, end, progress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Recompute mid for packet trajectory
  const mid = useMemo(() => {
    const m = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    m.y += 2; 
    return m;
  }, [start, end]);

  useFrame(() => {
    if (meshRef.current) {
        // Quadratic Bezier Interpolation: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const t = progress;
        const p0 = start;
        const p1 = mid;
        const p2 = end;

        meshRef.current.position.x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        meshRef.current.position.y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        meshRef.current.position.z = (1 - t) * (1 - t) * p0.z + 2 * (1 - t) * t * p1.z + t * t * p2.z;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

export default TensorNetwork;
