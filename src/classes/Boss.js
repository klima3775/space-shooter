// import { Graphics, Sprite } from "pixi.js";
// import { Bullet } from "./Bullet.js";

// export class Boss {
//   constructor(app, texture) {
//     this.app = app;
//     this.sprite = new Sprite(texture);
//     this.sprite.width = 150;
//     this.sprite.height = 100;
//     this.sprite.x = app.view.width / 2 - 75;
//     this.sprite.y = 50;
//     this.hp = 12; // Увеличено для нескольких фаз
//     this.hpBar = new Graphics();
//     this.bullets = [];
//     this.movingDirection = 1;
//     this.speed = 4;
//     this.phase = 1; // Текущая фаза босса
//     this.app.stage.addChild(this.sprite);
//     this.app.stage.addChild(this.hpBar);
//     this.shootingInterval = null;
//     this.init();
//   }

//   init() {
//     this.updateHpBar();

//     if (this.shootingInterval) {
//       clearInterval(this.shootingInterval);
//     }

//     console.log("Boss init: starting shooting interval");

//     this.shootingInterval = setInterval(() => {
//       if (this.app.gameOver || this.app.paused) {
//         clearInterval(this.shootingInterval);
//         return;
//       }

//       if (this.phase === 1) {
//         this.shoot();
//       } else if (this.phase === 2) {
//         this.shootMultiple();
//       } else if (this.phase === 3) {
//         this.shootLaser();
//       }
//     }, 2000);
//   }

//   updateHpBar() {
//     this.hpBar.clear();
//     this.hpBar.beginFill(0x00ff00);
//     const barWidth = (this.hp / 12) * 150; // Ширина полоски здоровья
//     this.hpBar.drawRect(this.sprite.x, this.sprite.y - 10, barWidth, 5);
//     this.hpBar.endFill();
//   }

//   shoot() {
//     if (this.app.paused) return;

//     const bullet = new Bullet(
//       this.app,
//       this.sprite.x + this.sprite.width / 2,
//       this.sprite.y + this.sprite.height,
//       1,
//       5,
//       0xff0000
//     );
//     this.bullets.push(bullet);
//     this.app.stage.addChild(bullet.sprite);
//   }

//   shootMultiple() {
//     if (this.app.paused) return;

//     // Стрельба в нескольких направлениях
//     const directions = [-1, 0, 1];
//     directions.forEach((dir) => {
//       const bullet = new Bullet(
//         this.app,
//         this.sprite.x + this.sprite.width / 2 + dir * 30,
//         this.sprite.y + this.sprite.height,
//         1,
//         5,
//         0xff9900
//       );
//       bullet.speedX = dir * 2; // Добавляем горизонтальное движение
//       this.bullets.push(bullet);
//       this.app.stage.addChild(bullet.sprite);
//     });
//   }

//   shootLaser() {
//     if (this.app.paused) return;

//     console.log("Firing laser in phase 3");

//     // Создаём лазер как широкий вертикальный луч
//     const laser = new Bullet(
//       this.app,
//       this.sprite.x + this.sprite.width / 2 - 25, // Центрируем лазер
//       this.sprite.y + this.sprite.height,
//       1,
//       3,
//       0xff0000 // Ярко-красный цвет для лазера
//     );
//     laser.sprite.width = 50; // Широкий луч
//     laser.sprite.height = 100; // Высокий луч
//     laser.speedY = 4; // Скорость движения вниз
//     this.bullets.push(laser);
//     this.app.stage.addChild(laser.sprite);
//   }

//   move() {
//     if (this.app.paused) return;

//     this.sprite.x += this.speed * this.movingDirection;

//     if (
//       this.sprite.x <= 0 ||
//       this.sprite.x + this.sprite.width >= this.app.view.width
//     ) {
//       this.movingDirection *= -1;
//     }

//     this.updateHpBar();
//   }

//   takeDamage() {
//     this.hp--;
//     this.updateHpBar();

//     if (this.hp <= 8 && this.phase === 1) {
//       this.phase = 2;
//       console.log("Boss entered Phase 2!");
//     } else if (this.hp <= 4 && this.phase === 2) {
//       this.phase = 3;
//       console.log("Boss entered Phase 3!");
//     }

//     if (this.hp <= 0) {
//       this.destroy();
//       return true;
//     }

//     return false;
//   }

//   update() {
//     if (this.app.paused) return;

//     this.move();

//     this.bullets.forEach((bullet, index) => {
//       bullet.update();

//       if (
//         bullet.sprite.y > this.app.view.height ||
//         bullet.sprite.x < 0 ||
//         bullet.sprite.x > this.app.view.width
//       ) {
//         this.app.stage.removeChild(bullet.sprite);
//         this.bullets.splice(index, 1);
//       }
//     });
//   }

//   destroy() {
//     console.log("Boss destroyed");
//     if (this.shootingInterval) {
//       clearInterval(this.shootingInterval);
//       this.shootingInterval = null;
//     }
//     this.app.stage.removeChild(this.sprite);
//     this.app.stage.removeChild(this.hpBar);
//     this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
//     this.bullets = [];
//   }
// }

import { Graphics, Sprite } from "pixi.js";
import { Bullet } from "./Bullet.js";

export class Boss {
  constructor(app, texture) {
    this.app = app;
    this.sprite = new Sprite(texture);
    this.sprite.width = 150;
    this.sprite.height = 100;
    this.sprite.x = app.canvas.width / 2 - 75; // Используем canvas вместо view
    this.sprite.y = 50;
    this.hp = 12; // Увеличено для нескольких фаз
    this.hpBar = new Graphics();
    this.bullets = [];
    this.movingDirection = 1;
    this.speed = 4;
    this.phase = 1; // Текущая фаза босса
    this.laser = null; // Лазер для третьей фазы
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
        this.activateLaser(); // Активируем лазер в третьей фазе
      }
    }, 2000);
  }

  updateHpBar() {
    this.hpBar.clear();
    this.hpBar.fill({ color: 0x00ff00 }); // Используем fill вместо beginFill
    const barWidth = (this.hp / 12) * 150; // Ширина полоски здоровья
    this.hpBar.rect(this.sprite.x, this.sprite.y - 10, barWidth, 5); // Используем rect вместо drawRect
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

  activateLaser() {
    if (this.laser) return; // Если лазер уже активен, ничего не делаем

    console.log("Activating laser in phase 3");

    // Создаем лазер как объект Graphics
    this.laser = new Graphics();
    this.laser.beginFill(0xff0000, 0.5); // Полупрозрачный красный цвет
    this.laser.drawRect(0, 0, 10, this.app.view.height); // Лазер по всей высоте экрана
    this.laser.endFill();
    this.laser.x = this.sprite.x + this.sprite.width / 2 - 5; // Центрируем лазер
    this.laser.y = this.sprite.y + this.sprite.height;

    this.app.stage.addChild(this.laser);

    // Таймер для мигания лазера
    this.laserBlinkInterval = setInterval(() => {
      if (this.laser.visible) {
        this.laser.visible = false; // Выключаем лазер
      } else {
        this.laser.visible = true; // Включаем лазер
      }
    }, 30); // Интервал мигания 30 миллисекунд
  }

  updateLaser() {
    if (!this.laser) return;

    // Лазер движется вместе с боссом
    this.laser.x = this.sprite.x + this.sprite.width / 2 - 5;

    // Проверяем наличие игрока перед проверкой столкновений
    if (!this.app.player || !this.app.player.sprite || !this.laser.visible)
      return;

    // Проверяем столкновения с игроком
    const laserBounds = this.laser.getBounds();
    const playerBounds = this.app.player.sprite.getBounds();

    if (
      laserBounds.x < playerBounds.x + playerBounds.width &&
      laserBounds.x + laserBounds.width > playerBounds.x &&
      laserBounds.y < playerBounds.y + playerBounds.height &&
      laserBounds.y + laserBounds.height > playerBounds.y
    ) {
      this.app.player.takeDamage(); // Наносим урон игроку
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
    this.updateLaser(); // Обновляем положение лазера

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
    if (this.laserBlinkInterval) {
      clearInterval(this.laserBlinkInterval); // Останавливаем мигание лазера
      this.laserBlinkInterval = null;
    }
    this.app.stage.removeChild(this.sprite);
    this.app.stage.removeChild(this.hpBar);
    if (this.laser) {
      this.app.stage.removeChild(this.laser); // Удаляем лазер
      this.laser = null;
    }
    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    this.bullets = [];
  }
}
