import { Sprite } from "pixi.js";

export class WallBlock {
  constructor(app, x, y, texture) {
    this.app = app;
    this.sprite = new Sprite(texture);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.width = 50;
    this.sprite.height = 50;

    this.app.stage.addChild(this.sprite);
  }

  destroy() {
    this.app.stage.removeChild(this.sprite);
  }
}
