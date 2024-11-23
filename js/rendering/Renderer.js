import { TERRAIN_TYPES } from "../config/gameConfig.js";

export class Renderer {
  constructor(canvas, tileSize) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.tileSize = tileSize;
    this.sandPattern = this.generateSandPattern();
  }

  generateSandPattern() {
    const pattern = [];
    const dotsCount = 12;
    for (let i = 0; i < dotsCount; i++) {
      pattern.push({
        x: (i % 4) * 10 + 5,
        y: Math.floor(i / 4) * 10 + 5,
      });
    }
    return pattern;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawMap(map, treePositions, cameraX, cameraY) {
    const startX = Math.floor(cameraX / this.tileSize);
    const startY = Math.floor(cameraY / this.tileSize);
    const endX = startX + Math.ceil(this.canvas.width / this.tileSize) + 1;
    const endY = startY + Math.ceil(this.canvas.height / this.tileSize) + 1;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (x >= 0 && x < map[0].length && y >= 0 && y < map.length) {
          this.drawTile(
            x - startX,
            y - startY,
            map[y][x],
            treePositions[y][x],
            cameraX,
            cameraY
          );
        }
      }
    }
  }

  drawTile(x, y, type, trees, cameraX, cameraY) {
    const xPos = x * this.tileSize - (cameraX % this.tileSize);
    const yPos = y * this.tileSize - (cameraY % this.tileSize);

    this.ctx.save();
    switch (type) {
      case TERRAIN_TYPES.GRASS:
      case TERRAIN_TYPES.FOREST:
      case TERRAIN_TYPES.DENSE_FOREST:
        this.ctx.fillStyle = "#90EE90";
        this.ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
        break;
      case TERRAIN_TYPES.WATER:
        this.ctx.fillStyle = "#4169E1";
        this.ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
        this.ctx.strokeStyle = "#6495ED";
        this.ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          this.ctx.moveTo(xPos, yPos + i * 10 + 5);
          this.ctx.bezierCurveTo(
            xPos + 10,
            yPos + i * 10,
            xPos + 30,
            yPos + i * 10 + 10,
            xPos + this.tileSize,
            yPos + i * 10 + 5
          );
        }
        this.ctx.stroke();
        break;
      case TERRAIN_TYPES.SAND:
        this.ctx.fillStyle = "#FFD700";
        this.ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
        this.ctx.fillStyle = "#DAA520";
        this.sandPattern.forEach((dot) => {
          this.ctx.beginPath();
          this.ctx.arc(xPos + dot.x, yPos + dot.y, 1, 0, Math.PI * 2);
          this.ctx.fill();
        });
        break;
    }

    if (type === TERRAIN_TYPES.FOREST || type === TERRAIN_TYPES.DENSE_FOREST) {
      this.drawTrees(xPos, yPos, trees, type === TERRAIN_TYPES.DENSE_FOREST);
    }

    this.ctx.restore();
  }

  drawTrees(xPos, yPos, trees, isDense) {
    if (!trees) return;

    this.ctx.fillStyle = isDense ? "#006400" : "#228B22";

    trees.forEach((pos) => {
      this.ctx.fillRect(xPos + pos.x - 1, yPos + pos.y + 5, 2, 5);
      this.ctx.beginPath();
      this.ctx.moveTo(xPos + pos.x - 5, yPos + pos.y + 5);
      this.ctx.lineTo(xPos + pos.x, yPos + pos.y - 5);
      this.ctx.lineTo(xPos + pos.x + 5, yPos + pos.y + 5);
      this.ctx.fill();
    });
  }
}
