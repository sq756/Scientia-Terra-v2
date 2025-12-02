
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GameState, LogicGateType, NodeState, SignalPacket, PaperEntity } from '../../types';

interface LogicEngineProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const PULSE_SPEED = 2.0; // Units per second
const CLOCK_INTERVAL = 2000; // ms

const LogicEngine: React.FC<LogicEngineProps> = ({ gameState, setGameState }) => {
  const lastClockRef = useRef<number>(0);

  // Helper: Process Logic Gate Truth Tables
  const processGate = (type: LogicGateType, inputs: number[], isActive: boolean): boolean => {
    const hasHighInput = inputs.some(i => i === 1);
    const highCount = inputs.filter(i => i === 1).length;
    const allHigh = inputs.length > 0 && inputs.every(i => i === 1);

    switch (type) {
      case LogicGateType.BUFFER: return hasHighInput;
      case LogicGateType.NOT: return !hasHighInput; // Invert input
      case LogicGateType.AND: return inputs.length >= 2 && allHigh;
      case LogicGateType.OR: return hasHighInput;
      case LogicGateType.NAND: return !(inputs.length >= 2 && allHigh);
      case LogicGateType.XOR: return highCount % 2 === 1; // Odd number of true inputs
      case LogicGateType.LATCH: 
         // SR Latch simplified: If input is high, set High. 
         // Realistically this needs 2 inputs (Set/Reset), treating any input as Toggle for simplicity in this game
         return hasHighInput ? !isActive : isActive;
      case LogicGateType.CLOCK: return isActive; // Clock handles its own state in the timer loop
      default: return false;
    }
  };

  useFrame((state, delta) => {
    const now = state.clock.elapsedTime * 1000;
    
    // 1. Move Signals
    let activeSignals: SignalPacket[] = [];
    let completedSignals: SignalPacket[] = [];

    // Advance signals
    if (gameState.signals.length > 0) {
      activeSignals = gameState.signals.map(sig => ({
        ...sig,
        progress: sig.progress + delta * PULSE_SPEED
      })).filter(sig => {
        if (sig.progress >= 1) {
          completedSignals.push(sig);
          return false;
        }
        return true;
      });
    }

    // 2. Process Completed Signals (Inputs arriving at nodes)
    let nodesNeedUpdate = false;
    const nodeUpdates = new Map<string, number[]>(); // nodeId -> new inputs

    if (completedSignals.length > 0) {
      nodesNeedUpdate = true;
      completedSignals.forEach(sig => {
        if (!nodeUpdates.has(sig.targetId)) {
          nodeUpdates.set(sig.targetId, []);
        }
        nodeUpdates.get(sig.targetId)?.push(sig.value);
      });
    }

    // 3. Clock Pulse Generation
    let clockTriggered = false;
    if (now - lastClockRef.current > CLOCK_INTERVAL) {
      lastClockRef.current = now;
      clockTriggered = true;
    }

    // 4. Update Game State if Physics happened
    if (nodesNeedUpdate || clockTriggered || activeSignals.length !== gameState.signals.length) {
      setGameState(prev => {
        const newSignals = [...activeSignals];
        
        const updatedNodes = prev.nodes.map(node => {
          // Skip if not constructed or no logic
          if (node.state !== NodeState.CONSTRUCTED || !node.logic) return node;

          // Collect inputs
          const newInputs = nodeUpdates.get(node.id) || [];
          
          // Combine with existing buffer if needed (for latching behavior) or just take new ones
          // For this simulation, we consume inputs immediately on arrival tick
          const currentInputs = [...node.logic.inputBuffer, ...newInputs];

          // Determine next state
          let nextActive = node.logic.isActive;
          let shouldFire = false;

          if (node.logic.type === LogicGateType.CLOCK) {
            if (clockTriggered) {
              nextActive = !node.logic.isActive; // Toggle Clock
              shouldFire = nextActive;
            }
          } else if (currentInputs.length > 0) {
            // Process Gate Logic only when inputs arrive
            nextActive = processGate(node.logic.type, currentInputs, node.logic.isActive);
            shouldFire = nextActive;
          }

          // Fire Outputs
          if (shouldFire) {
             node.connections.forEach(targetId => {
               newSignals.push({
                 id: `${node.id}-${targetId}-${now}-${Math.random()}`,
                 sourceId: node.id,
                 targetId: targetId,
                 progress: 0,
                 value: 1
               });
             });
          }

          return {
            ...node,
            logic: {
              ...node.logic,
              isActive: nextActive,
              inputBuffer: [] // Clear buffer after processing
            }
          };
        });

        return {
          ...prev,
          nodes: updatedNodes,
          signals: newSignals
        };
      });
    }
  });

  return null;
};

export default LogicEngine;
