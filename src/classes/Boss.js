import { Graphics, Sprite } from "pixi.js";
import { Bullet } from "./Bullet.js";

export class Boss {
  constructor(app, texture, sounds, game) {
    this.app = app;
    this.game = game;
    this.sprite = new Sprite(texture);
    this.sprite.width = 150;
    this.sounds = sounds;
    this.sprite.height = 100;
    this.sprite.x = app.screen.width / 2 - 75;
    this.sprite.y = 50;
    this.hp = 12;
    this.hpBar = new Graphics();    this.bullets = [];
    this.movingDirection = 1;
    this.speed = 6;
    this.phase = 1;
    this.shootingInterval = null;
    this.burstInterval = null;
    this.isBursting = false;
    this.phaseChangeInterval = null;
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

    this.startShooting();
    this.startPhaseChangeTimer();
  }
  startShooting() {
    this.shootingInterval = setInterval(() => {
      if (this.game.gameOver || this.game.paused) {
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
  startPhaseChangeTimer() {
    if (this.phaseChangeInterval) {
      clearInterval(this.phaseChangeInterval);
    }

    this.phaseChangeInterval = setInterval(() => {
      if (this.game.gameOver || this.game.paused) {
        return;
      }

      this.phase = (this.phase % 3) + 1;
      console.log("Boss phase changed to:", this.phase);      if (this.phase === 1) {
        this.speed = 6;
      } else if (this.phase === 2) {
        this.speed = 8;
      } else if (this.phase === 3) {
        this.speed = 10;
      }
    }, 10000);
  }

  updateHpBar() {
    this.hpBar.clear();
    this.hpBar.beginFill(0x00ff00);
    const barWidth = (this.hp / 12) * 150;
    this.hpBar.drawRect(this.sprite.x, this.sprite.y - 10, barWidth, 5);
    this.hpBar.endFill();
  }
  shoot() {
    if (this.game.paused) return;
    this.sounds.enemyShoot.play();const bullet = new Bullet(
      this.app,
      this.sprite.x + this.sprite.width / 2,
      this.sprite.y + this.sprite.height,
      1,
      8,
      0xff0000
    );
    this.bullets.push(bullet);
    this.app.stage.addChild(bullet.sprite);
  }
  shootMultiple() {
    if (this.game.paused) return;
    this.sounds.enemyShoot.play();
    const directions = [-1, 0, 1];
    directions.forEach((dir) => {      const bullet = new Bullet(
        this.app,
        this.sprite.x + this.sprite.width / 2 + dir * 30,
        this.sprite.y + this.sprite.height,
        1,
        8,
        0xff9900
      );
      bullet.speedX = dir * 3;
      this.bullets.push(bullet);
      this.app.stage.addChild(bullet.sprite);
    });
  }
  shootBurst() {
    if (this.game.paused || this.isBursting) return;
    this.sounds.enemyShoot.play();
    this.isBursting = true;
    let burstCount = 0;
    const maxBursts = 3;    this.burstInterval = setInterval(() => {
      if (this.game.paused || this.game.gameOver) {
        clearInterval(this.burstInterval);
        this.isBursting = false;
        return;
      }

      [-0.5, 0.5].forEach((dir) => {        const bullet = new Bullet(
          this.app,
          this.sprite.x + this.sprite.width / 2 + dir * 20,
          this.sprite.y + this.sprite.height,
          1,
          10,
          0xff00ff
        );
        bullet.speedX = dir * 5;
        this.bullets.push(bullet);
        this.app.stage.addChild(bullet.sprite);
      });

      burstCount++;
      if (burstCount >= maxBursts) {
        clearInterval(this.burstInterval);
        this.isBursting = false;
      }
    }, 300);
  }
  move() {
    if (this.game.paused) return;

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

    console.log("Boss took damage, hp:", this.hp);

    if (this.hp <= 0) {
      this.destroy();
      return true;
    }

    return false;
  }
  update() {
    if (this.game.paused) return;

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

  pause(paused) {
    if (paused) {
      
      if (this.shootingInterval) {
        clearInterval(this.shootingInterval);
        this.shootingInterval = null;
      }
      if (this.burstInterval) {
        clearInterval(this.burstInterval);
        this.burstInterval = null;
        this.isBursting = false;
      }
      if (this.phaseChangeInterval) {
        clearInterval(this.phaseChangeInterval);
        this.phaseChangeInterval = null;
      }
    } else {
      
      if (!this.shootingInterval) {
        this.startShooting();
      }
      if (!this.phaseChangeInterval) {
        this.startPhaseChangeTimer();
      }
      
    }
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
    if (this.phaseChangeInterval) {
      clearInterval(this.phaseChangeInterval);
      this.phaseChangeInterval = null;
    }
    this.app.stage.removeChild(this.sprite);
    this.app.stage.removeChild(this.hpBar);
    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    this.bullets = [];
  }
}