import { Sprite } from "pixi.js";
import { Bullet } from "./Bullet.js";

export class SmallEnemy {
  constructor(app, x, y, texture) {
    this.app = app;
    this.sprite = new Sprite(texture);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.anchor.set(0.5);
    this.bullets = [];
    this.health = 1;
    this.speed = 2;
    this.app.stage.addChild(this.sprite);
    this.shootingInterval = setInterval(() => this.shoot(), 2000); // Стреляют каждые 2 секунды
  }

  shoot() {
    const bullet = new Bullet(this.app, this.sprite.x, this.sprite.y, 1); // Пуля летит вниз
    this.bullets.push(bullet);
  }

  update() {
    // Синусоидальное движение по горизонтали
    this.sprite.x += Math.sin(Date.now() * 0.001) * this.speed;
    // Ограничение движения по краям экрана
    this.sprite.x = Math.max(
      25,
      Math.min(this.app.view.width - 25, this.sprite.x)
    );
    // Обновление пуль
    this.bullets.forEach((bullet) => bullet.update());
  }

  takeDamage() {
    this.health--;
    if (this.health <= 0) {
      clearInterval(this.shootingInterval);
      return true; // Враг уничтожен
    }
    return false;
  }

  destroy() {
    this.app.stage.removeChild(this.sprite);
    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    clearInterval(this.shootingInterval);
  }
}
