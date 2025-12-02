
import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, KeyboardControls, Environment } from '@react-three/drei';
import NodeMesh from './components/World/NodeMesh';
import TerminalOverlay from './components/UI/TerminalOverlay';
import IntroSequence from './components/UI/IntroSequence';
import TutorialOverlay from './components/UI/TutorialOverlay';
import Crosshair from './components/UI/Crosshair';
import Player from './components/World/Player';
import Terrain from './components/World/Terrain';
import TensorNetwork from './components/World/TensorNetwork';
import LogicEngine from './components/Systems/LogicEngine';
import { INITIAL_NODES } from './constants';
import { GameState, NodeState, TutorialStep, LogicGateType } from './types';

// Keyboard mapping
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    nodes: INITIAL_NODES,
    signals: [], // Logic signals on the wires
    selectedNodeId: null,
    scannedNodeId: null,
    inventory: {
      truthCrystals: 0,
      entropyReduced: 0,
    },
    isTerminalOpen: false,
    gameStarted: false,
    tutorialStep: TutorialStep.INTRO, 
  });

  const [isHoveringNode, setIsHoveringNode] = useState(false);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      tutorialStep: TutorialStep.MOVEMENT
    }));
  };

  // Tutorial Progress Checker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.tutorialStep === TutorialStep.MOVEMENT) {
        if (['w','a','s','d','W','A','S','D'].includes(e.key)) {
          setTimeout(() => {
             setGameState(prev => ({ ...prev, tutorialStep: TutorialStep.SCANNING }));
          }, 1500);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.tutorialStep]);


  const handleNodeClick = (id: string) => {
    if (gameState.tutorialStep >= TutorialStep.SCANNING) {
      setGameState(prev => ({
        ...prev,
        selectedNodeId: id,
        isTerminalOpen: true,
        tutorialStep: prev.tutorialStep === TutorialStep.REFINING ? TutorialStep.COMPLETED : prev.tutorialStep
      }));
    }
  };

  const handleNodeScan = (id: string) => {
    setGameState(prev => ({
      ...prev,
      scannedNodeId: id,
      tutorialStep: prev.tutorialStep === TutorialStep.SCANNING ? TutorialStep.REFINING : prev.tutorialStep
    }));
  };

  const closeTerminal = () => {
    setGameState(prev => ({
      ...prev,
      isTerminalOpen: false,
      selectedNodeId: null,
    }));
  };

  const handleConstructionComplete = (id: string, result: any) => {
    setGameState(prev => {
      const node = prev.nodes.find(n => n.id === id);
      if (!node) return prev;

      // Yield calculation now based on 'stability'
      const baseValue = result.stability;
      const decayFactor = Math.pow(2, node.discoveryCount);
      const actualYield = Math.floor(baseValue / decayFactor);

      const updatedNodes = prev.nodes.map(n => 
        n.id === id 
          ? { 
              ...n, 
              state: NodeState.CONSTRUCTED, 
              construction: result, 
              discoveryCount: n.discoveryCount + 1,
              // Initialize default logic state (BUFFER)
              logic: { type: LogicGateType.BUFFER, isActive: false, inputBuffer: [] } 
            } 
          : n
      );
      
      return {
        ...prev,
        nodes: updatedNodes,
        inventory: {
          truthCrystals: prev.inventory.truthCrystals + (result.stability > 90 ? 5 : 1), 
          entropyReduced: prev.inventory.entropyReduced + actualYield
        }
      };
    });
  };

  const handleUpdateLogic = (id: string, logicType: LogicGateType) => {
    setGameState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === id && n.logic 
        ? { ...n, logic: { ...n.logic, type: logicType } } 
        : n
      )
    }));
  };

  const selectedNode = gameState.nodes.find(n => n.id === gameState.selectedNodeId);
  const scannedNode = gameState.nodes.find(n => n.id === gameState.scannedNodeId);

  const getScannerData = (node: any) => {
    const yieldPercent = (100 / Math.pow(2, node.discoveryCount)).toFixed(2);
    return { yieldPercent, count: node.discoveryCount };
  };

  return (
    <div className="w-full h-screen relative bg-slate-950 overflow-hidden">
      
      {!gameState.gameStarted && <IntroSequence onComplete={startGame} />}

      <KeyboardControls map={keyboardMap}>
        <div className="absolute inset-0 z-0">
          <Canvas shadows camera={{ fov: 60 }}>
            <Environment preset="city" />
            <ambientLight intensity={0.1} />
            <pointLight position={[50, 50, 50]} intensity={1} castShadow />
            <directionalLight position={[-20, 30, 20]} intensity={2} castShadow shadow-mapSize={[2048, 2048]} />
            <Stars radius={200} depth={50} count={10000} factor={6} saturation={0} fade speed={0.5} />
            <fog attach="fog" args={['#020617', 5, 60]} /> 

            <Suspense fallback={null}>
              <LogicEngine gameState={gameState} setGameState={setGameState} />
              
              <Terrain />
              <Player 
                isLocked={gameState.gameStarted && !gameState.isTerminalOpen} 
                onInteract={handleNodeClick}
                onScan={handleNodeScan}
                onHover={setIsHoveringNode}
              />
              
              <TensorNetwork 
                nodes={gameState.nodes} 
                signals={gameState.signals}
                selectedNodeId={gameState.selectedNodeId} 
              />

              {gameState.nodes.map((node) => (
                <NodeMesh 
                  key={node.id} 
                  data={node} 
                  isSelected={gameState.selectedNodeId === node.id}
                  isScanned={gameState.scannedNodeId === node.id}
                  onClick={() => {}} 
                />
              ))}
            </Suspense>
          </Canvas>
        </div>
      </KeyboardControls>

      {/* HUD Layer */}
      {gameState.gameStarted && (
        <div className="absolute top-0 left-0 z-10 pointer-events-none w-full h-full">
          
          <Crosshair hovering={isHoveringNode} />

          <div className="absolute top-0 left-0 p-6 flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              SCIENTIA TERRA
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               BUILDER MODE // ONLINE
            </div>
          </div>

          {/* Scanner HUD */}
          {scannedNode && !gameState.isTerminalOpen && (
             <div className="absolute top-1/2 left-1/2 translate-x-12 -translate-y-12 animate-in fade-in zoom-in duration-200">
               <div className="bg-black/80 border border-cyan-500/50 p-4 rounded backdrop-blur-md w-64">
                  <div className="text-xs font-mono text-cyan-500 mb-1">SCANNER RESULT</div>
                  <div className="text-white font-bold truncate">{scannedNode.title}</div>
                  <div className="h-px bg-cyan-900 my-2"></div>
                  {scannedNode.state === NodeState.CONSTRUCTED && scannedNode.construction ? (
                     <div className="text-sm font-mono text-green-400 mb-2">
                       STABILITY: {scannedNode.construction.stability}%
                     </div>
                  ) : null}
                  {scannedNode.logic ? (
                     <div className="text-sm font-mono text-purple-400 mb-2">
                       LOGIC: {scannedNode.logic.type} [{scannedNode.logic.isActive ? "1" : "0"}]
                     </div>
                  ) : null}
                  <div className="flex justify-between items-center text-sm font-mono mt-1">
                    <span className="text-slate-400">Yield Potential:</span>
                    <span className={`${parseFloat(getScannerData(scannedNode).yieldPercent) > 25 ? 'text-green-400' : 'text-red-400'}`}>
                      {getScannerData(scannedNode).yieldPercent}%
                    </span>
                  </div>
               </div>
             </div>
          )}

          <TutorialOverlay step={gameState.tutorialStep} />

          {/* Inventory */}
          <div className="absolute top-6 right-6">
            <div className="backdrop-blur-sm bg-slate-900/50 border border-slate-700 p-4 w-64 rounded-sm shadow-xl">
               <div className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Construction Resources</div>
               
               <div className="flex justify-between items-center mb-2">
                 <span className="text-cyan-400 text-sm">Truth Crystals</span>
                 <span className="text-xl font-bold font-mono text-white">{gameState.inventory.truthCrystals}</span>
               </div>
               
               <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-4">
                 <div 
                   className="bg-cyan-500 h-full transition-all duration-1000" 
                   style={{ width: `${Math.min(gameState.inventory.truthCrystals * 10, 100)}%` }}
                 ></div>
               </div>

               <div className="flex justify-between items-center">
                 <span className="text-purple-400 text-sm">Structure Mass</span>
                 <span className="text-xl font-bold font-mono text-white">{gameState.inventory.entropyReduced}</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal / Builder Interface */}
      {gameState.isTerminalOpen && selectedNode && (
        <TerminalOverlay 
          node={selectedNode} 
          onClose={closeTerminal}
          onRefineComplete={handleConstructionComplete}
          onUpdateLogic={handleUpdateLogic}
        />
      )}
    </div>
  );
};

export default App;
