export const TERRAIN_TYPES = {
  GRASS: 0,
  WATER: 1,
  SAND: 2,
  FOREST: 3,
  DENSE_FOREST: 4,
};

export const WORLD_GEN_CONFIG = {
  // Parametry wody
  water: {
    seedPercent: 0.005,
    iterations: 6,
    growthChance: 0.8,
    minNeighbors: 1,
    smoothNeighbors: 3,
  },

  // Parametry piasku
  sand: {
    smoothNeighbors: 2,
  },

  // Parametry lasu
  forest: {
    seedPercent: 0.02,
    types: [TERRAIN_TYPES.FOREST, TERRAIN_TYPES.DENSE_FOREST],
    growthChance: 1,
    minNeighbors: 2,
    treesPerTile: {
      [TERRAIN_TYPES.FOREST]: 2,
      [TERRAIN_TYPES.DENSE_FOREST]: 4,
    },
  },
};

export const PROFESSIONS = {
  BUILDER: 'builder',
  LUMBERJACK: 'lumberjack',
  FARMER: 'farmer',
  MINER: 'miner',
  TRADER: 'trader',
};

export const PROFESSION_COLORS = {
  [PROFESSIONS.BUILDER]: '#FF6B6B',    // Czerwony - budowniczy
  [PROFESSIONS.LUMBERJACK]: '#45B7D1', // Niebieski - drwal
  [PROFESSIONS.FARMER]: '#96CEB4',     // Zielony - farmer
  [PROFESSIONS.MINER]: '#4ECDC4',      // Turkusowy - górnik
  [PROFESSIONS.TRADER]: '#FFEEAD',     // Żółty - handlarz
};
