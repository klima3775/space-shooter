import { Graphics } from "pixi.js";

export class Bullet {
  constructor(app, x, y, direction = -1, width = 5, height = 10, speed = 8) {
    this.app = app;
    this.sprite = new Graphics();
    this.sprite.fill(0xffffff);
    this.sprite.rect(0, 0, 5, 10);
    this.sprite.fill();
    this.sprite.x = x;
    this.sprite.y = y;
    this.app.stage.addChild(this.sprite);
    this.speed = speed;
    this.direction = direction;
    this.width = width;
    this.height = height;
  }

  update() {
    this.sprite.y += this.speed * this.direction;
  }
}