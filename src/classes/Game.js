import { Text } from "pixi.js";
import { Player } from "./Player.js";
import { Bullet } from "./Bullet.js";
import { Asteroid } from "./Asteroid.js";
import { StarBackground } from "./StarBackground.js";

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
    this.app.stage.addChild(this.timerText);
    this.init();
  }

  async init() {
    await this.starBackground.init();
    this.createAsteroids();
    this.setupControls();
    this.startGameLoop();
    this.startTimer();
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
    if (this.bulletCount < this.maxBullets) {
      const bullet = new Bullet(
        this.app,
        this.player.sprite.x + 22.5,
        this.player.sprite.y
      );
      this.bullets.push(bullet);
      this.bulletCount++;
    }
  }

  checkCollisions() {
    this.bullets.forEach((bullet, bulletIndex) => {
      this.asteroids.forEach((asteroid, asteroidIndex) => {
        const dx = bullet.sprite.x - asteroid.sprite.x;
        const dy = bullet.sprite.y - asteroid.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          this.app.stage.removeChild(bullet.sprite);
          this.app.stage.removeChild(asteroid.sprite);
          this.bullets.splice(bulletIndex, 1);
          this.asteroids.splice(asteroidIndex, 1);
        }
      });
    });
  }

  update() {
    if (this.gameOver) return;

    this.bullets.forEach((bullet) => bullet.update());
    this.checkCollisions();

    if (this.asteroids.length === 0) {
      this.endGame("YOU WIN");
    } else if (
      this.bulletCount >= this.maxBullets &&
      (this.bullets.length === 0 || this.asteroids.length > 0) // no bullets on screen or asteroids remain
    ) {
      this.endGame("YOU LOSE");
    }
  }

  endGame(message) {
    console.log("End game triggered:", message);
    this.gameOver = true;

    // Создаем текст с сообщением
    const text = new Text(message, {
      fontSize: 50,
      fill: 0xffffff,
      align: "center",
    });
    // center the text
    text.x = this.app.view.width / 2 - text.width / 2;
    text.y = this.app.view.height / 2 - text.height / 2;

    console.log("Adding text to stage...");
    this.app.stage.addChild(text);
  }

  startGameLoop() {
    this.app.ticker.add(() => {
      if (!this.gameOver) {
        this.update();
      }
    });
  }

  // new method for starting the timer
  startTimer() {
    const timerInterval = setInterval(() => {
      if (this.gameOver) {
        clearInterval(timerInterval);
        return;
      }

      this.timer--;
      this.timerText.text = `Time: ${this.timer}`;

      if (this.timer <= 0) {
        clearInterval(timerInterval);
        this.endGame("YOU LOSE");
      }
    }, 1000);
  }
}
