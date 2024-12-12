import { Graphics, Sprite } from "pixi.js";
import { Bullet } from "./Bullet.js";

export class Boss {
  constructor(app, texture) {
    this.app = app;
    this.sprite = new Sprite(texture);
    this.sprite.width = 150;
    this.sprite.height = 100;
    this.sprite.x = app.view.width / 2 - 50;
    this.sprite.y = 50;
    this.hp = 4;
    this.hpBar = new Graphics();
    this.bullets = [];
    this.movingDirection = 1;
    this.speed = 3;
    this.app.stage.addChild(this.sprite);
    this.app.stage.addChild(this.hpBar);
    this.init();
  }

  init() {
    this.updateHpBar();

    console.log("Boss init: starting shooting interval");

    this.shootingInterval = setInterval(() => {
      if (this.app.gameOver) {
        console.log("Clearing boss interval due to game over");
        clearInterval(this.shootingInterval); // Очистка интервала
        return;
      }
      console.log("Boss shooting");
      this.shoot();
    }, 2000);
  }

  updateHpBar() {
    this.hpBar.clear();
    this.hpBar.fill(0x00ff00);
    const barWidth = (this.hp / 4) * 100;
    this.hpBar.rect(this.sprite.x, this.sprite.y - 10, barWidth, 5);
    this.hpBar.fill();
  }

  shoot() {
    const bullet = new Bullet(
      this.app,
      this.sprite.x + 50,
      this.sprite.y + 50,
      1, // direction
      3, // speed
      0xff0000
    );
    this.bullets.push(bullet);
    this.app.stage.addChild(bullet.sprite);
  }

  move() {
    this.sprite.x += this.speed * this.movingDirection;

    if (this.sprite.x <= 0 || this.sprite.x + 100 >= this.app.view.width) {
      this.movingDirection *= -1;
    }

    this.updateHpBar();
  }

  takeDamage() {
    this.hp--;

    if (this.hp <= 0) {
      this.destroy();
      return true;
    }

    return false;
  }

  update() {
    this.move();

    this.bullets.forEach((bullet, index) => {
      bullet.update();

      if (bullet.sprite.y > this.app.view.height) {
        this.app.stage.removeChild(bullet.sprite);
        this.bullets.splice(index, 1);
      }
    });
  }

  destroy() {
    console.log("Boss destroyed");
    clearInterval(this.shootingInterval); // Удаляем интервал
    this.app.stage.removeChild(this.sprite);
    this.app.stage.removeChild(this.hpBar);
    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    this.bullets = [];
  }
}
