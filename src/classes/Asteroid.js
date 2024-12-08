import { Graphics } from "pixi.js";

export class Asteroid {
  constructor(app, x, y) {
    this.app = app;
    this.sprite = new Graphics();
    this.sprite.fill(0xff0000);
    this.sprite.circle(0, 0, 40);
    this.sprite.fill();
    this.sprite.x = x;
    this.sprite.y = y;
    this.app.stage.addChild(this.sprite);
  }
}
