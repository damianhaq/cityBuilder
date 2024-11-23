import { TERRAIN_TYPES, WORLD_GEN_CONFIG } from '../config/gameConfig.js';

export class TerrainGenerator {
  constructor(mapWidth, mapHeight) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  generateMap() {
    const map = this.createEmptyTerrain();
    this.generateWater(map);
    this.generateSand(map);
    this.generateForest(map);
    return map;
  }

  createEmptyTerrain() {
    return Array(this.mapHeight)
      .fill()
      .map(() => Array(this.mapWidth).fill(TERRAIN_TYPES.GRASS));
  }

  generateWater(map) {
    const waterSeeds = this.generateWaterSeeds();
    for (let iteration = 0; iteration < WORLD_GEN_CONFIG.water.iterations; iteration++) {
      this.growWater(map, waterSeeds);
    }
    this.smoothTerrain(map, TERRAIN_TYPES.WATER, WORLD_GEN_CONFIG.water.smoothNeighbors);
  }

  generateWaterSeeds() {
    const seeds = [];
    const count = Math.floor(
      this.mapWidth * this.mapHeight * WORLD_GEN_CONFIG.water.seedPercent
    );

    for (let i = 0; i < count; i++) {
      seeds.push({
        x: Math.floor(Math.random() * this.mapWidth),
        y: Math.floor(Math.random() * this.mapHeight),
      });
    }
    return seeds;
  }

  growWater(map, waterSeeds) {
    waterSeeds.forEach((seed) => {
      map[seed.y][seed.x] = TERRAIN_TYPES.WATER;
    });

    const mapCopy = map.map((row) => [...row]);

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (
          mapCopy[y][x] === TERRAIN_TYPES.GRASS &&
          Math.random() < WORLD_GEN_CONFIG.water.growthChance
        ) {
          const waterNeighbors = this.getNeighborsOfType(
            x,
            y,
            mapCopy,
            TERRAIN_TYPES.WATER
          );
          if (waterNeighbors > WORLD_GEN_CONFIG.water.minNeighbors) {
            map[y][x] = TERRAIN_TYPES.WATER;
          }
        }
      }
    }
  }

  generateSand(map) {
    const mapCopy = map.map((row) => [...row]);

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (mapCopy[y][x] === TERRAIN_TYPES.GRASS) {
          const waterNeighbors = this.getNeighborsOfType(
            x,
            y,
            mapCopy,
            TERRAIN_TYPES.WATER
          );
          if (waterNeighbors > 0 && this.hasDirectWaterNeighbor(x, y, mapCopy)) {
            map[y][x] = TERRAIN_TYPES.SAND;
          }
        }
      }
    }

    this.smoothTerrain(map, TERRAIN_TYPES.SAND, WORLD_GEN_CONFIG.sand.smoothNeighbors);
  }

  generateForest(map) {
    const forestSeeds = this.generateForestSeeds(map);
    this.growForest(map, forestSeeds);
  }

  generateForestSeeds(map) {
    const seeds = [];
    const count = Math.floor(
      this.mapWidth * this.mapHeight * WORLD_GEN_CONFIG.forest.seedPercent
    );

    for (const type of WORLD_GEN_CONFIG.forest.types) {
      for (let i = 0; i < count; i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * this.mapWidth);
          y = Math.floor(Math.random() * this.mapHeight);
        } while (map[y][x] !== TERRAIN_TYPES.GRASS);

        seeds.push({ x, y, type });
      }
    }
    return seeds;
  }

  growForest(map, forestSeeds) {
    for (let iteration = 0; iteration < 3; iteration++) {
      forestSeeds.forEach((seed) => {
        if (map[seed.y][seed.x] === TERRAIN_TYPES.GRASS) {
          map[seed.y][seed.x] = seed.type;
        }
      });

      const mapCopy = map.map((row) => [...row]);

      for (let y = 0; y < this.mapHeight; y++) {
        for (let x = 0; x < this.mapWidth; x++) {
          if (
            mapCopy[y][x] === TERRAIN_TYPES.GRASS &&
            Math.random() < WORLD_GEN_CONFIG.forest.growthChance
          ) {
            for (const type of WORLD_GEN_CONFIG.forest.types) {
              const sameTypeNeighbors = this.getNeighborsOfType(x, y, mapCopy, type);
              if (sameTypeNeighbors > WORLD_GEN_CONFIG.forest.minNeighbors) {
                map[y][x] = type;
                break;
              }
            }
          }
        }
      }
    }
  }

  getNeighborsOfType(x, y, map, type) {
    let count = 0;
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],          [1, 0],
      [-1, 1],  [0, 1], [1, 1]
    ];

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (
        newX >= 0 &&
        newX < this.mapWidth &&
        newY >= 0 &&
        newY < this.mapHeight &&
        map[newY][newX] === type
      ) {
        count++;
      }
    }

    return count;
  }

  hasDirectWaterNeighbor(x, y, map) {
    const directions = [
      [0, -1],
      [-1, 0],
      [1, 0],
      [0, 1],
    ];

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (
        newX >= 0 &&
        newX < this.mapWidth &&
        newY >= 0 &&
        newY < this.mapHeight &&
        map[newY][newX] === TERRAIN_TYPES.WATER
      ) {
        return true;
      }
    }
    return false;
  }

  smoothTerrain(map, terrainType, minNeighbors) {
    const mapCopy = map.map((row) => [...row]);

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (map[y][x] === terrainType) {
          const sameTypeNeighbors = this.getNeighborsOfType(x, y, mapCopy, terrainType);
          if (sameTypeNeighbors < minNeighbors) {
            map[y][x] = TERRAIN_TYPES.GRASS;
          }
        }
      }
    }
  }
}
