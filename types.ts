
export enum BiomeType {
  QUANTUM_POLES = 'Quantum Poles',
  SILICON_WASTELAND = 'Silicon Wasteland',
  LIFE_PRIMORDIAL_SOUP = 'Primordial Soup',
  UNKNOWN_VOID = 'Unknown Void'
}

export enum NodeState {
  RAW = 'RAW', // Emits Entropy, needs refining
  REFINING = 'REFINING',
  CONSTRUCTED = 'CONSTRUCTED' // It is now a building block
}

export enum LogicGateType {
  BUFFER = 'BUFFER', // Just passes signal (Repeater)
  NOT = 'NOT',       // Inverter
  AND = 'AND',
  OR = 'OR',
  NAND = 'NAND',     // Universal Gate
  XOR = 'XOR',
  CLOCK = 'CLOCK',   // Emits pulse periodically
  LATCH = 'LATCH'    // Simple Memory
}

export interface LogicState {
  type: LogicGateType;
  isActive: boolean; // Output is High (1)
  inputBuffer: number[]; // 1s and 0s received since last tick
}

export interface PaperEntity {
  id: string;
  position: [number, number, number];
  title: string;
  abstract: string; // The "Raw Data"
  biome: BiomeType;
  state: NodeState;
  discoveryCount: number;
  connections: string[]; // IDs of related papers (The Tensor Network)
  
  // Populated after construction (formerly refining)
  construction?: {
    structureType: string;
    stability: number; // 0-100
    visualManifestation: string;
    analysis: string;
  };

  // The Turing Machine State
  logic?: LogicState;
}

export interface PlayerInventory {
  truthCrystals: number;
  entropyReduced: number;
}

export enum TutorialStep {
  INTRO = 0,
  MOVEMENT = 1,
  SCANNING = 2,
  REFINING = 3,
  COMPLETED = 4
}

export interface SignalPacket {
  id: string;
  sourceId: string;
  targetId: string;
  progress: number; // 0 to 1
  value: number; // 1 or 0
}

export interface GameState {
  nodes: PaperEntity[];
  signals: SignalPacket[]; // Active data moving on wires
  selectedNodeId: string | null;
  scannedNodeId: string | null;
  inventory: PlayerInventory;
  isTerminalOpen: boolean;
  gameStarted: boolean;
  tutorialStep: TutorialStep;
}
