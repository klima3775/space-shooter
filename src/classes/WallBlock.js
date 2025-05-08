import { Graphics } from "pixi.js";

export class WallBlock {
  constructor(app, x, y) {
    this.app = app;

    // Create a rectangle using Graphics
    this.sprite = new Graphics();
    this.sprite.beginFill(0x888888); // Gray color, you can change this
    this.sprite.drawRect(0, 0, 50, 50); // 50x50 rectangle
    this.sprite.endFill();

    // Position the rectangle
    this.sprite.x = x;
    this.sprite.y = y;

    this.app.stage.addChild(this.sprite);
  }

  destroy() {
    this.app.stage.removeChild(this.sprite);
    this.sprite.destroy();
  }
}
