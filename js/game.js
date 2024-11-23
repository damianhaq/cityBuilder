import { TerrainGenerator } from "./generators/TerrainGenerator.js";
import { Renderer } from "./rendering/Renderer.js";
import { GameStorage } from "./storage/GameStorage.js";
import { TERRAIN_TYPES } from "./config/gameConfig.js";
import { Citizen } from "./entities/Citizen.js";

export class GameMap {
  constructor(canvasId, mapWidth, mapHeight) {
    this.initializeBasicProperties(canvasId, mapWidth, mapHeight);
    this.setupKeyboardControls();
    this.loadOrCreateNewGame();
    this.startGameLoop();

    // Dodanie instancji do window dla dostępu z innych klas
    window.gameInstance = this;
  }

  initializeBasicProperties(canvasId, mapWidth, mapHeight) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }

    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.tileSize = 40;
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraSpeed = 5;
    this.isMoving = false;
    this.lastTime = 0;
    this.lastUpdateTime = 0;
    this.updateInterval = 1000 / 60;

    this.renderer = new Renderer(this.canvas, this.tileSize);
    this.citizens = [];
  }

  loadOrCreateNewGame() {
    const savedGame = GameStorage.getLastSave();
    if (savedGame) {
      this.loadGameState(savedGame);
    } else {
      this.createNewGame();
    }
  }

  createNewGame() {
    const generator = new TerrainGenerator(this.mapWidth, this.mapHeight);
    this.map = generator.generateMap();
    this.generateTreePositions();
    this.createInitialCitizens();

    // Reset kamery
    this.cameraX = 0;
    this.cameraY = 0;

    // Odświeżenie widoku
    this.draw();
  }

  createInitialCitizens() {
    const centerX = Math.floor(this.map[0].length / 2);
    const centerY = Math.floor(this.map.length / 2);

    // Znajdź odpowiednie miejsce startowe (nie w wodzie)
    let startX = centerX;
    let startY = centerY;
    const searchRadius = 5;

    for (let r = 0; r < searchRadius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const x = centerX + dx;
          const y = centerY + dy;
          if (
            x >= 0 &&
            x < this.map[0].length &&
            y >= 0 &&
            y < this.map.length
          ) {
            if (this.map[y][x] !== TERRAIN_TYPES.WATER) {
              startX = x;
              startY = y;
              r = searchRadius; // Przerwij wszystkie pętle
              break;
            }
          }
        }
        if (r === searchRadius) break;
      }
    }

    // Tworzenie mieszkańców w znalezionym miejscu
    this.citizens = Array(10)
      .fill(null)
      .map(() => new Citizen(startX, startY, this.map, null, this));
  }

  generateTreePositions() {
    this.treePositions = Array(this.mapHeight)
      .fill()
      .map(() => Array(this.mapWidth).fill(null));

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (
          this.map[y][x] === TERRAIN_TYPES.FOREST ||
          this.map[y][x] === TERRAIN_TYPES.DENSE_FOREST
        ) {
          const count = this.map[y][x] === TERRAIN_TYPES.FOREST ? 2 : 4;
          const positions = [];
          for (let i = 0; i < count; i++) {
            positions.push({
              x: 10 + Math.random() * 20,
              y: 10 + Math.random() * 20,
            });
          }
          this.treePositions[y][x] = positions;
        }
      }
    }
  }

  setupKeyboardControls() {
    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false,
    };

    window.addEventListener("keydown", (e) => {
      if (this.keys.hasOwnProperty(e.key)) {
        this.keys[e.key] = true;
        if (!this.isMoving) {
          this.isMoving = true;
          this.startGameLoop();
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (this.keys.hasOwnProperty(e.key)) {
        this.keys[e.key] = false;
        if (Object.values(this.keys).every((v) => !v)) {
          this.isMoving = false;
        }
      }
    });
  }

  startGameLoop() {
    const gameLoop = (currentTime) => {
      if (this.lastTime === 0) {
        this.lastTime = currentTime;
        this.lastUpdateTime = currentTime;
      }

      const deltaTime = currentTime - this.lastUpdateTime;

      // Aktualizacja tylko gdy minął odpowiedni czas
      if (deltaTime >= this.updateInterval) {
        // Aktualizacja pozycji kamery
        if (this.keys.w) this.cameraY -= this.cameraSpeed;
        if (this.keys.s) this.cameraY += this.cameraSpeed;
        if (this.keys.a) this.cameraX -= this.cameraSpeed;
        if (this.keys.d) this.cameraX += this.cameraSpeed;

        // Aktualizacja mieszkańców
        this.citizens.forEach((citizen) => citizen.update());

        this.lastUpdateTime = currentTime;
      }

      this.draw();
      this.lastTime = currentTime;
      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }

  draw() {
    this.renderer.clearCanvas();
    this.renderer.drawMap(
      this.map,
      this.treePositions,
      this.cameraX,
      this.cameraY
    );

    // Rysowanie mieszkańców
    this.citizens.forEach((citizen) => {
      citizen.draw(
        this.renderer.ctx,
        this.cameraX,
        this.cameraY,
        this.tileSize
      );
    });
  }

  saveGame(saveName = "autosave") {
    return GameStorage.saveGame(
      {
        map: this.map,
        treePositions: this.treePositions,
        cameraX: this.cameraX,
        cameraY: this.cameraY,
        citizens: this.citizens.map((citizen) => ({
          x: citizen.x,
          y: citizen.y,
          color: citizen.color,
          profession: citizen.profession,
        })),
      },
      saveName
    );
  }

  loadGame(saveName = "autosave") {
    const gameState = GameStorage.loadGame(saveName);
    if (gameState) {
      this.loadGameState(gameState);
      return true;
    }
    return false;
  }

  loadGameState(gameState) {
    this.map = gameState.map;
    this.treePositions = gameState.treePositions;
    this.cameraX = gameState.cameraX;
    this.cameraY = gameState.cameraY;

    // Odtwarzanie mieszkańców
    if (gameState.citizens) {
      this.citizens = gameState.citizens.map(
        (citizenData) =>
          new Citizen(citizenData.x, citizenData.y, this.map, citizenData.profession, this)
      );
    } else {
      this.createInitialCitizens();
    }

    this.draw();
  }

  getSavesList() {
    return GameStorage.getSavesList();
  }

  deleteSave(saveName) {
    return GameStorage.deleteSave(saveName);
  }
}
