import { Graphics } from "pixi.js";

export class Asteroid {
  constructor(app, x, y) {
    this.sprite = new Graphics();
    this.sprite.beginFill(0xff0000);
    this.sprite.drawCircle(0, 0, 20);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
    app.stage.addChild(this.sprite);
  }
}
