import { TERRAIN_TYPES } from '../config/gameConfig.js';

export class Citizen {
    constructor(x, y, map, color = null) {
        this.x = x;
        this.y = y;
        this.map = map;
        this.speed = 0.02;
        this.targetX = x;
        this.targetY = y;
        this.moveTimer = 0;
        this.color = color || this.getRandomColor();
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.moveTimer--;
        if (this.moveTimer <= 0) {
            this.selectNewTarget();
            this.moveTimer = 200 + Math.random() * 300;
        }

        // Poruszanie się w kierunku celu
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.1) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    selectNewTarget() {
        const range = 5;
        let newX, newY;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            newX = this.x + (Math.random() * range * 2 - range);
            newY = this.y + (Math.random() * range * 2 - range);
            attempts++;
        } while (
            !this.isValidPosition(Math.floor(newX), Math.floor(newY)) && 
            attempts < maxAttempts
        );

        if (this.isValidPosition(Math.floor(newX), Math.floor(newY))) {
            this.targetX = newX;
            this.targetY = newY;
        }
    }

    isValidPosition(x, y) {
        if (x < 0 || y < 0 || x >= this.map[0].length || y >= this.map.length) {
            return false;
        }
        return this.map[y][x] !== TERRAIN_TYPES.WATER;
    }

    draw(ctx, cameraX, cameraY, tileSize) {
        const screenX = (this.x * tileSize) - cameraX;
        const screenY = (this.y * tileSize) - cameraY;

        // Rysowanie postaci
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}
