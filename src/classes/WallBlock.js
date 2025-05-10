import { Graphics } from "pixi.js";

export class WallBlock {
  constructor(app, x, y, shatterEffect) {
    this.app = app;
    this.shatterEffect = shatterEffect;

    this.sprite = new Graphics();
    this.sprite.beginFill(0xff0000);
    this.sprite.drawRect(0, 0, 50, 50);
    this.sprite.endFill();

    this.sprite.x = x;
    this.sprite.y = y;

    this.app.stage.addChild(this.sprite);
  }

  destroy() {
    if (this.shatterEffect) {
      this.shatterEffect.create(this.sprite, 0xff0000);
    }

    // Удаляем блок
    this.app.stage.removeChild(this.sprite);
    this.sprite.destroy();
  }
}
