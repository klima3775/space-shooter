import { Graphics, Sprite } from "pixi.js";
import { Bullet } from "./Bullet.js";

export class Boss {
  constructor(app, texture) {
    this.app = app;
    this.sprite = new Sprite(texture);
    this.sprite.width = 150;
    this.sprite.height = 100;
    this.sprite.x = app.view.width / 2 - 75;
    this.sprite.y = 50;
    this.hp = 12; // Увеличено для нескольких фаз
    this.hpBar = new Graphics();
    this.bullets = [];
    this.movingDirection = 1;
    this.speed = 4;
    this.phase = 1; // Текущая фаза босса
    this.app.stage.addChild(this.sprite);
    this.app.stage.addChild(this.hpBar);
    this.shootingInterval = null;
    this.init();
  }

  init() {
    this.updateHpBar();

    if (this.shootingInterval) {
      clearInterval(this.shootingInterval);
    }

    console.log("Boss init: starting shooting interval");

    this.shootingInterval = setInterval(() => {
      if (this.app.gameOver || this.app.paused) {
        clearInterval(this.shootingInterval);
        return;
      }

      if (this.phase === 1) {
        this.shoot();
      } else if (this.phase === 2) {
        this.shootMultiple();
      } else if (this.phase === 3) {
        this.summonMeteors();
      }
    }, 2000);
  }

  updateHpBar() {
    this.hpBar.clear();
    this.hpBar.beginFill(0x00ff00);
    const barWidth = (this.hp / 12) * 150; // Ширина полоски здоровья
    this.hpBar.drawRect(this.sprite.x, this.sprite.y - 10, barWidth, 5);
    this.hpBar.endFill();
  }

  shoot() {
    if (this.app.paused) return;

    const bullet = new Bullet(
      this.app,
      this.sprite.x + this.sprite.width / 2,
      this.sprite.y + this.sprite.height,
      1,
      5,
      0xff0000
    );
    this.bullets.push(bullet);
    this.app.stage.addChild(bullet.sprite);
  }

  shootMultiple() {
    if (this.app.paused) return;

    // Стрельба в нескольких направлениях
    const directions = [-1, 0, 1];
    directions.forEach((dir) => {
      const bullet = new Bullet(
        this.app,
        this.sprite.x + this.sprite.width / 2 + dir * 30,
        this.sprite.y + this.sprite.height,
        1,
        5,
        0xff9900
      );
      bullet.speedX = dir * 2; // Добавляем горизонтальное движение
      this.bullets.push(bullet);
      this.app.stage.addChild(bullet.sprite);
    });
  }

  summonMeteors() {
    if (this.app.paused) return;

    // Призываем метеориты
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * (this.app.view.width - 50);
      const meteor = new Bullet(
        this.app,
        x,
        -50,
        1,
        3,
        0xaaaaaa // Цвет метеорита
      );
      meteor.speedY = 4; // Увеличиваем скорость падения
      this.bullets.push(meteor);
      this.app.stage.addChild(meteor.sprite);
    }
  }

  move() {
    if (this.app.paused) return;

    this.sprite.x += this.speed * this.movingDirection;

    if (
      this.sprite.x <= 0 ||
      this.sprite.x + this.sprite.width >= this.app.view.width
    ) {
      this.movingDirection *= -1;
    }

    this.updateHpBar();
  }

  takeDamage() {
    this.hp--;
    this.updateHpBar();

    if (this.hp <= 8 && this.phase === 1) {
      this.phase = 2;
      console.log("Boss entered Phase 2!");
    } else if (this.hp <= 4 && this.phase === 2) {
      this.phase = 3;
      console.log("Boss entered Phase 3!");
    }

    if (this.hp <= 0) {
      this.destroy();
      return true;
    }

    return false;
  }

  update() {
    if (this.app.paused) return;

    this.move();

    this.bullets.forEach((bullet, index) => {
      bullet.update();

      if (
        bullet.sprite.y > this.app.view.height ||
        bullet.sprite.x < 0 ||
        bullet.sprite.x > this.app.view.width
      ) {
        this.app.stage.removeChild(bullet.sprite);
        this.bullets.splice(index, 1);
      }
    });
  }

  destroy() {
    console.log("Boss destroyed");
    if (this.shootingInterval) {
      clearInterval(this.shootingInterval);
      this.shootingInterval = null;
    }
    this.app.stage.removeChild(this.sprite);
    this.app.stage.removeChild(this.hpBar);
    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    this.bullets = [];
  }
}
