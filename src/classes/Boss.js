import { Graphics, Sprite } from "pixi.js";
import { Bullet } from "./Bullet.js";

export class Boss {
  constructor(app, texture) {
    this.app = app;
    this.sprite = new Sprite(texture);
    this.sprite.width = 150;
    this.sprite.height = 100;
    this.sprite.x = app.screen.width / 2 - 75;
    this.sprite.y = 50;
    this.hp = 12;
    this.hpBar = new Graphics();
    this.bullets = [];
    this.movingDirection = 1;
    this.speed = 4; // Начальная скорость
    this.phase = 1;
    this.shootingInterval = null;
    this.burstInterval = null; // Для залпов на третьей фазе
    this.isBursting = false; // Флаг для отслеживания состояния залпа
    this.app.stage.addChild(this.sprite);
    this.app.stage.addChild(this.hpBar);
    this.init();
  }

  init() {
    this.updateHpBar();

    if (this.shootingInterval) {
      clearInterval(this.shootingInterval);
    }

    console.log("Boss init: starting shooting interval, phase:", this.phase);

    this.shootingInterval = setInterval(() => {
      if (this.app.gameOver || this.app.paused) {
        clearInterval(this.shootingInterval);
        return;
      }

      console.log("Boss shooting, phase:", this.phase, "hp:", this.hp);

      if (this.phase === 1) {
        this.shoot();
      } else if (this.phase === 2) {
        this.shootMultiple();
      } else if (this.phase === 3) {
        this.shootBurst();
      }
    }, 2000);
  }

  updateHpBar() {
    this.hpBar.clear();
    this.hpBar.beginFill(0x00ff00); // Зеленая полоса здоровья
    const barWidth = (this.hp / 12) * 150;
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
      bullet.speedX = dir * 2;
      this.bullets.push(bullet);
      this.app.stage.addChild(bullet.sprite);
    });
  }

  shootBurst() {
    if (this.app.paused || this.isBursting) return;

    this.isBursting = true;
    let burstCount = 0;
    const maxBursts = 3; // Количество выстрелов в залпе

    this.burstInterval = setInterval(() => {
      if (this.app.paused || this.app.gameOver) {
        clearInterval(this.burstInterval);
        this.isBursting = false;
        return;
      }

      // Стреляем двумя пулями с небольшим разбросом
      [-0.5, 0.5].forEach((dir) => {
        const bullet = new Bullet(
          this.app,
          this.sprite.x + this.sprite.width / 2 + dir * 20,
          this.sprite.y + this.sprite.height,
          1,
          6, // Увеличенная скорость
          0xff00ff // Фиолетовые пули
        );
        bullet.speedX = dir * 3; // Горизонтальный разброс
        this.bullets.push(bullet);
        this.app.stage.addChild(bullet.sprite);
      });

      burstCount++;
      if (burstCount >= maxBursts) {
        clearInterval(this.burstInterval);
        this.isBursting = false;
      }
    }, 300); // Интервал между выстрелами в залпе
  }

  move() {
    if (this.app.paused) return;

    this.sprite.x += this.speed * this.movingDirection;

    if (
      this.sprite.x <= 0 ||
      this.sprite.x + this.sprite.width >= this.app.screen.width
    ) {
      this.movingDirection *= -1;
    }

    this.updateHpBar();
  }

  takeDamage() {
    this.hp--;
    this.updateHpBar();

    console.log("Boss took damage, hp:", this.hp, "phase:", this.phase);

    if (this.hp <= 8 && this.phase === 1) {
      this.phase = 2;
      this.speed = 5;
      console.log("Boss entered Phase 2! Speed increased to", this.speed);
    } else if (this.hp <= 4 && this.phase === 2) {
      this.phase = 3;
      this.speed = 6;
      console.log("Boss entered Phase 3! Speed increased to", this.speed);
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
        bullet.sprite.y > this.app.screen.height ||
        bullet.sprite.x < 0 ||
        bullet.sprite.x > this.app.screen.width
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
    if (this.burstInterval) {
      clearInterval(this.burstInterval);
      this.burstInterval = null;
    }
    this.app.stage.removeChild(this.sprite);
    this.app.stage.removeChild(this.hpBar);
    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    this.bullets = [];
  }
}
