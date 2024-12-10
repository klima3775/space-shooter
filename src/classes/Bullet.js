import { Graphics } from "pixi.js";

export class Bullet {
  constructor(app, x, y, direction = -1, speed = 15) {
    this.app = app;
    this.sprite = new Graphics();
    this.sprite.fill(0xffffff);
    this.sprite.rect(0, 0, 15, 30);
    this.sprite.fill();
    this.sprite.x = x;
    this.sprite.y = y;
    this.app.stage.addChild(this.sprite);
    this.speed = speed;
    this.direction = direction;
  }

  update() {
    this.sprite.y += this.speed * this.direction;
  }
}
