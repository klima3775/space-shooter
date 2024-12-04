import { Graphics } from "pixi.js";

export class Player {
  constructor(app) {
    this.app = app;
    this.sprite = new Graphics();
    this.sprite.beginFill(0x66ccff);
    this.sprite.drawRect(0, 0, 50, 50);
    this.sprite.endFill();
    this.sprite.x = this.app.view.width / 2 - 25;
    this.sprite.y = this.app.view.height - 60;
    this.app.stage.addChild(this.sprite);
    this.speed = 40;
  }

  moveLeft() {
    if (this.sprite.x > 0) {
      this.sprite.x -= this.speed;
    }
  }

  moveRight() {
    if (this.sprite.x < this.app.view.width - 50) {
      this.sprite.x += this.speed;
    }
  }
}
