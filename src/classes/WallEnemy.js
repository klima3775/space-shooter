import { Sprite } from "pixi.js";
import { Bullet } from "./Bullet.js";

export class WallEnemy {
  constructor(app, x, y, texture, game) {
    this.app = app;
    this.game = game;
    this.sprite = new Sprite(texture);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.anchor.set(0.5);
    this.health = 1; // Мини-враг уничтожается с одного попадания
    this.bullets = [];
    this.app.stage.addChild(this.sprite);

    this.shootingInterval = setInterval(() => {
      this.shoot();
    }, 2000 + Math.random() * 1000);
  }

  shoot() {
    if (this.game.isGameOver || this.game.paused) return; // Проверяем, не закончилась ли игра

    const bullet = new Bullet(
      this.app,
      this.sprite.x,
      this.sprite.y,
      1,
      this.game.texture.bulletEnemy,
      1
    );
    this.bullets.push(bullet);
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy();
    }
  }
}
