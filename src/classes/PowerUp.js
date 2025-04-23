import { Graphics } from "pixi.js";

export class PowerUp {
  constructor(app, x, y, type) {
    this.app = app;
    this.type = type;
    this.sprite = new Graphics();
    this.sprite.fill(this.getColor());
    this.sprite.circle(0, 0, 15);
    this.sprite.fill();
    this.sprite.x = x;
    this.sprite.y = y;
    this.app.stage.addChild(this.sprite);
    this.speed = 2;
  }

  getColor() {
    switch (this.type) {
      case "extraBullets":
        return 0x00ff00; // Зеленый для дополнительных пуль
      case "shield":
        return 0x0000ff; // Синий для щита
      case "bulletSpeed":
        return 0xffff00; // Желтый для скорости пуль
      default:
        return 0xffffff;
    }
  }

  update() {
    this.sprite.y += this.speed;
    if (this.sprite.y > this.app.view.height) {
      this.app.stage.removeChild(this.sprite);
      const index = this.app.game.powerUps.indexOf(this);
      if (index !== -1) this.app.game.powerUps.splice(index, 1);
    }
  }
}
