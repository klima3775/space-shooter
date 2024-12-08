import { Graphics } from "pixi.js";
import { Bullet } from "./Bullet.js";

export class Boss {
  constructor(app) {
    this.app = app;
    this.sprite = new Graphics();
    this.sprite.fill(0xff0000);
    this.sprite.rect(0, 0, 100, 50);
    this.sprite.fill();
    this.sprite.x = app.view.width / 2 - 50;
    this.sprite.y = 50;
    this.hp = 4;
    this.hpBar = new Graphics();
    this.bullets = [];
    this.movingDirection = 1;
    this.speed = 2;
    this.app.stage.addChild(this.sprite);
    this.app.stage.addChild(this.hpBar);
    this.init();
  }

  init() {
    this.updateHpBar();

    this.shootingInterval = setInterval(() => {
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
      1 // speed
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
    clearInterval(this.shootingInterval);
    this.app.stage.removeChild(this.sprite);
    this.app.stage.removeChild(this.hpBar);
    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    this.bullets = [];
  }
}
