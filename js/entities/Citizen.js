import { TERRAIN_TYPES, PROFESSIONS, PROFESSION_COLORS } from "../config/gameConfig.js";

export class Citizen {
  constructor(x, y, map, profession = null, gameInstance = null) {
    this.x = x;
    this.y = y;
    this.map = map;
    this.speed = 0.02;
    this.targetX = null;
    this.targetY = null;
    this.task = null;
    this.profession = profession || this.getRandomProfession();
    this.state = "idle"; // idle, moving, working
    this.gameInstance = gameInstance;
  }

  getRandomProfession() {
    const professions = Object.values(PROFESSIONS);
    return professions[Math.floor(Math.random() * professions.length)];
  }

  update() {
    if (
      this.state === "moving" &&
      this.targetX !== null &&
      this.targetY !== null
    ) {
      this.moveTowardsTarget();
    }
  }

  moveTowardsTarget() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.1) {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    } else {
      // Cel osiągnięty
      this.x = this.targetX;
      this.y = this.targetY;
      this.state = "idle";
      this.targetX = null;
      this.targetY = null;

      if (this.task) {
        this.startWorking();
      }
    }
  }

  assignTask(task, targetX, targetY) {
    this.task = task;
    this.targetX = targetX;
    this.targetY = targetY;
    this.state = "moving";
  }

  startWorking() {
    this.state = "working";
    // Tutaj będzie logika wykonywania zadania
    // Na razie tylko zmiana stanu na 'idle' po "wykonaniu" zadania
    this.state = "idle";
    this.task = null;
  }

  isValidPosition(x, y) {
    if (x < 0 || y < 0 || x >= this.map[0].length || y >= this.map.length) {
      return false;
    }
    return this.map[y][x] !== TERRAIN_TYPES.WATER;
  }

  draw(ctx, cameraX, cameraY, tileSize) {
    const screenX = this.x * tileSize - cameraX;
    const screenY = this.y * tileSize - cameraY;

    // Sprawdzanie czy jest więcej mieszkańców w tym samym miejscu
    if (this.gameInstance) {
      const samePositionCitizens = this.gameInstance.citizens.filter(
        c => Math.floor(c.x) === Math.floor(this.x) && Math.floor(c.y) === Math.floor(this.y)
      );

      // Rysowanie licznika jeśli jest więcej niż jeden mieszkaniec
      if (samePositionCitizens.length > 1) {
        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`x${samePositionCitizens.length}`, screenX, screenY - 25);
      }
    }

    // Rysowanie stanu i profesji
    ctx.font = "10px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`${this.profession} (${this.state})`, screenX, screenY - 15);

    // Rysowanie postaci
    const size = 6; // Rozmiar postaci

    // Głowa
    ctx.fillStyle = PROFESSION_COLORS[this.profession];
    ctx.beginPath();
    ctx.arc(screenX, screenY - size, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Ciało
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - size / 2);
    ctx.lineTo(screenX, screenY + size);
    ctx.strokeStyle = PROFESSION_COLORS[this.profession];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ręce
    ctx.beginPath();
    ctx.moveTo(screenX - size / 2, screenY);
    ctx.lineTo(screenX + size / 2, screenY);
    ctx.stroke();

    // Nogi
    ctx.beginPath();
    ctx.moveTo(screenX, screenY + size);
    ctx.lineTo(screenX - size / 2, screenY + size * 1.5);
    ctx.moveTo(screenX, screenY + size);
    ctx.lineTo(screenX + size / 2, screenY + size * 1.5);
    ctx.stroke();

    // Cień
    ctx.beginPath();
    ctx.ellipse(
      screenX,
      screenY + size * 1.6,
      size / 2,
      size / 4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fill();
  }
}
