import { Sprite } from "pixi.js";

export class Asteroid {
  constructor(app, x, y, texture) {
    this.app = app;
    this.sprite = new Sprite(texture);
    this.sprite.width = 150;
    this.sprite.height = 150;
    this.sprite.x = x;
    this.sprite.y = y;
    this.app.stage.addChild(this.sprite);
  }
}
