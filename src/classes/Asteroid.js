import { Sprite } from "pixi.js";

export class Asteroid {
  constructor(app, x, y, texture) {
    this.app = app;
    this.sprite = new Sprite(texture);
    this.sprite.width = 150;
    this.sprite.height = 150;
    this.sprite.x = x;
    this.sprite.y = y;
    this.speedX = Math.random() * 2 - 1; // Горизонтальная скорость (-1 до 1)
    this.speedY = Math.random() * 2 + 1; // Вертикальная скорость (1 до 3)

    this.app.stage.addChild(this.sprite);
  }

  // Заглушка для будущего движения
  update() {
    if (this.app.paused) return;

    this.sprite.x += this.speedX;
    this.sprite.y += this.speedY;

    if (this.sprite.x < 0) {
      this.sprite.x = 0;
      this.speedX *= -1; // Меняем направление
    } else if (this.sprite.x > this.app.view.width - this.sprite.width) {
      this.sprite.x = this.app.view.width - this.sprite.width;
      this.speedX *= -1; // Меняем направление
    }

    // Ограничиваем минимальную и максимальную координату Y
    const maxY = this.app.view.height - this.sprite.height - 160; // Ограничение по Y (например, на 100 пикселей выше нижнего края)
    if (this.sprite.y < 0) {
      this.sprite.y = 0;
      this.speedY *= -1; // Меняем направление
    } else if (this.sprite.y > maxY) {
      this.sprite.y = maxY;
      this.speedY *= -1; // Меняем направление
    }
  }
}
