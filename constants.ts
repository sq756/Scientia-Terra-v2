import { BiomeType, PaperEntity, NodeState } from './types';

// Mock data to simulate the "Fog of Ignorance" populating
export const INITIAL_NODES: PaperEntity[] = [
  // Cluster 1: Silicon Wasteland (AI/CS)
  {
    id: 'p1',
    position: [5, 2, 5],
    title: 'Attention Is All You Need',
    abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.',
    biome: BiomeType.SILICON_WASTELAND,
    state: NodeState.RAW,
    discoveryCount: 1420, 
    connections: ['p2', 'p3', 'p_new_ai'], // Connects to other AI papers
  },
  {
    id: 'p2',
    position: [7, 1, 6],
    title: 'Deep Residual Learning for Image Recognition',
    abstract: 'We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.',
    biome: BiomeType.SILICON_WASTELAND,
    state: NodeState.RAW,
    discoveryCount: 890,
    connections: ['p3'],
  },
  {
    id: 'p3',
    position: [4, 4, 4],
    title: 'Generative Adversarial Nets',
    abstract: 'We propose a new framework for estimating generative models via an adversarial process.',
    biome: BiomeType.SILICON_WASTELAND,
    state: NodeState.RAW,
    discoveryCount: 500,
    connections: [],
  },
  {
    id: 'p_new_ai',
    position: [12, 3, 2],
    title: 'Liquid Time-Constant Networks',
    abstract: 'We introduce a new class of time-continuous recurrent neural network models. Liquid networks.',
    biome: BiomeType.SILICON_WASTELAND,
    state: NodeState.RAW,
    discoveryCount: 0, 
    connections: ['p1'],
  },

  // Cluster 2: Quantum Poles (Physics)
  {
    id: 'p4',
    position: [-8, 5, -8],
    title: 'Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?',
    abstract: 'In a complete theory there is an element corresponding to each element of reality.',
    biome: BiomeType.QUANTUM_POLES,
    state: NodeState.RAW,
    discoveryCount: 5000,
    connections: ['p5'], // Einstein connects to Einstein
  },
  {
    id: 'p5',
    position: [-6, 3, -9],
    title: 'On the Electrodynamics of Moving Bodies',
    abstract: 'It is known that Maxwells electrodynamics—as usually understood at the present time—when applied to moving bodies, leads to asymmetries.',
    biome: BiomeType.QUANTUM_POLES,
    state: NodeState.RAW,
    discoveryCount: 10000,
    connections: [],
  },

  // Cluster 3: Primordial Soup (Biology)
  {
    id: 'p6',
    position: [-5, -2, 8],
    title: 'Molecular Structure of Nucleic Acids',
    abstract: 'We wish to suggest a structure for the salt of deoxyribose nucleic acid (D.N.A.).',
    biome: BiomeType.LIFE_PRIMORDIAL_SOUP,
    state: NodeState.RAW,
    discoveryCount: 2000,
    connections: ['p7'], // Genetics connects to Evolution
  },
  {
    id: 'p7',
    position: [-7, -1, 6],
    title: 'The Origin of Species by Means of Natural Selection',
    abstract: 'As many more individuals of each species are born than can possibly survive...',
    biome: BiomeType.LIFE_PRIMORDIAL_SOUP,
    state: NodeState.RAW,
    discoveryCount: 50000,
    connections: [],
  },
  {
    id: 'p_new_bio',
    position: [-10, 2, 12],
    title: 'Xenobots: Computer Designed Organisms',
    abstract: 'We report here a method for designing completely biological machines from the ground up.',
    biome: BiomeType.LIFE_PRIMORDIAL_SOUP,
    state: NodeState.RAW,
    discoveryCount: 1, 
    connections: ['p6', 'p1'], // Connects to DNA and AI (Interdisciplinary!)
  },
];