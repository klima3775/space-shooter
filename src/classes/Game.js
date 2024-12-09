import { Text } from "pixi.js";
import { Player } from "./Player.js";
import { Bullet } from "./Bullet.js";
import { Asteroid } from "./Asteroid.js";
import { StarBackground } from "./StarBackground.js";
import { Boss } from "./Boss.js";

export class Game {
  constructor(app) {
    this.app = app;
    this.player = new Player(app);
    this.bullets = [];
    this.asteroids = [];
    this.maxBullets = 10;
    this.bulletCount = 0;
    this.gameOver = false;
    this.starBackground = new StarBackground(app);
    this.timer = 60; // Таймер на 60 секунд
    this.timerText = new Text(`Time: ${this.timer}`, {
      fontSize: 24,
      fill: 0xffffff,
    });
    this.timerText.x = 10;
    this.timerText.y = 10;
    this.bulletText = new Text(`Bullets: ${this.maxBullets}`, {
      fontSize: 24,
      fill: 0xffffff,
    });
    this.bulletText.x = 10;
    this.bulletText.y = 40;

    this.app.stage.addChild(this.timerText);
    this.app.stage.addChild(this.bulletText);
    this.init();
  }

  async init() {
    await this.starBackground.init();

    if (this.asteroids.length === 0 && !this.boss) {
      this.createAsteroids();
    }

    this.setupControls();

    if (!this.boss) {
      this.startTimer();
    }

    this.startGameLoop();
  }

  createAsteroids() {
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (this.app.view.width - 40) + 20;
      const y = Math.random() * (this.app.view.height / 2 - 40) + 20;
      this.asteroids.push(new Asteroid(this.app, x, y));
    }
  }

  setupControls() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.player.moveLeft();
      } else if (e.key === "ArrowRight") {
        this.player.moveRight();
      } else if (e.key === " ") {
        this.shoot();
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        this.player.stop();
      }
    });
  }

  shoot() {
    if (this.bulletCount <= this.maxBullets) {
      const bullet = new Bullet(
        this.app,
        this.player.sprite.x + 22.5,
        this.player.sprite.y,
        -1
      );
      this.bullets.push(bullet);
      this.bulletCount++;

      // Обновляем текст оставшихся пуль
      this.bulletText.text = `Bullets: ${Math.max(
        this.maxBullets - this.bulletCount,
        0
      )}`;

      // Предупреждение, если выпущена последняя доступная пуля
      if (this.bulletCount === this.maxBullets) {
        const warningText = new Text("Last bullet!", {
          fontSize: 20,
          fill: 0xff0000,
        });
        warningText.x = this.app.view.width / 2 - warningText.width / 2;
        warningText.y = this.app.view.height / 2 - warningText.height / 2;

        this.app.stage.addChild(warningText);

        // Убираем предупреждение через 1 секунду
        setTimeout(() => {
          this.app.stage.removeChild(warningText);
        }, 1000);
      }
    }

    // Проверка поражения, если выпущено больше допустимого количества пуль
    if (
      this.bulletCount > this.maxBullets &&
      (this.bullets.length === 0 || this.asteroids.length > 0 || this.boss)
    ) {
      this.endGame("YOU LOSE");
    }
  }

  isIntersecting(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  checkCollisions() {
    // Проверка столкновений пуль с астероидами
    this.bullets.forEach((bullet, bulletIndex) => {
      const bulletBounds = bullet.sprite.getBounds();

      this.asteroids.forEach((asteroid, asteroidIndex) => {
        const asteroidBounds = asteroid.sprite.getBounds();

        if (this.isIntersecting(bulletBounds, asteroidBounds)) {
          this.app.stage.removeChild(bullet.sprite);
          this.app.stage.removeChild(asteroid.sprite);
          this.bullets.splice(bulletIndex, 1);
          this.asteroids.splice(asteroidIndex, 1);
        }
      });

      // Проверка столкновений с боссом
      if (this.boss) {
        const bossBounds = this.boss.sprite.getBounds();

        if (this.isIntersecting(bulletBounds, bossBounds)) {
          this.app.stage.removeChild(bullet.sprite);
          this.bullets.splice(bulletIndex, 1);

          if (this.boss.takeDamage()) {
            this.boss.destroy();
            this.boss = null;
            this.endGame("YOU WIN");
          }
        }
      }
    });

    // Проверка столкновений пуль босса с игроком
    if (this.boss) {
      this.boss.bullets.forEach((bullet, bulletIndex) => {
        const bulletBounds = bullet.sprite.getBounds();
        const playerBounds = this.player.sprite.getBounds();

        if (this.isIntersecting(bulletBounds, playerBounds)) {
          this.app.stage.removeChild(bullet.sprite);
          this.boss.bullets.splice(bulletIndex, 1);
          this.endGame("YOU LOSE");
        }
      });
    }
  }

  update() {
    if (this.gameOver) return;

    this.bullets.forEach((bullet) => bullet.update());
    this.checkCollisions();

    if (this.asteroids.length === 0) {
      if (!this.boss) {
        this.boss = new Boss(this.app);
        this.bulletCount = 0; // Скидаємо кількість куль
        this.maxBullets = 10;

        this.bullets.forEach((bullet) => {
          this.app.stage.removeChild(bullet.sprite);
        });
        this.bullets = [];

        // Оновлюємо текст про кулі
        this.bulletText.text = `Bullets: ${this.maxBullets}`;

        this.resetTimer();
      } else {
        this.boss.update();
      }
    }
  }

  endGame(message) {
    this.gameOver = true;

    const text = new Text(message, {
      fontSize: 50,
      fill: 0xffffff,
      align: "center",
    });

    text.x = this.app.view.width / 2 - text.width / 2;
    text.y = this.app.view.height / 2 - text.height / 2;

    this.app.stage.addChild(text);
  }

  startGameLoop() {
    this.app.ticker.add(() => {
      if (!this.gameOver) {
        this.update();
      }
    });
  }

  startTimer() {
    if (this.timer === 0) {
      this.timer = 60;
    }

    this.timerInterval = setInterval(() => {
      if (this.gameOver) {
        clearInterval(this.timerInterval);
        return;
      }

      this.timer--;
      this.timerText.text = `Time: ${this.timer}`;

      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.endGame("YOU LOSE");
      }
    }, 1000);
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.timer = 60;
    this.timerText.text = `Time: ${this.timer}`;
    this.startTimer();
  }
}
