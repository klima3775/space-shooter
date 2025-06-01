import { Graphics } from "pixi.js";

export class Bullet {
  constructor(app, x, y, direction, speed = 8, color = 0xffff00) {
    this.app = app;
    this.sprite = new Graphics();
    this.sprite.fill(color);
    this.sprite.rect(0, 0, 5, 10);
    this.sprite.fill();
    this.sprite.x = x;    this.sprite.y = y;
    this.direction = direction;
    this.speed = speed;
    this.speedX = 0; // Додаємо горизонтальну швидкість
    this.app.stage.addChild(this.sprite);
  }

  update() {
    if (this.app.paused) return;

    this.sprite.y += this.direction * this.speed;
    if (this.sprite.y < 0 || this.sprite.y > this.app.view.height) {
      this.app.stage.removeChild(this.sprite);
    }
  }
}
