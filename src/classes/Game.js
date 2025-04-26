import { Text, Container, Graphics } from "pixi.js";
import { Player } from "./Player.js";
import { Bullet } from "./Bullet.js";
import { Asteroid } from "./Asteroid.js";
import { StarBackground } from "./StarBackground.js";
import { Boss } from "./Boss.js";
import { ShatterEffect } from "./ShatterEffect.js";

export class Game {
  constructor(app, textures, sound) {
    this.app = app;
    this.textures = textures;
    this.player = new Player(app, this, textures.player);
    this.shatterEffect = new ShatterEffect(app);
    this.bullets = [];
    this.asteroids = [];
    this.maxBullets = 10;
    this.bulletCount = 0;
    this.gameOver = false;
    this.paused = false;
    this.boss = null;
    this.shootCooldown = false; // Добавляем флаг для предотвращения множественных выстрелов

    // UI для паузы
    this.pauseMenu = new Container();
    this.pauseMenu.visible = false;
    this.app.stage.addChild(this.pauseMenu);

    // Полупрозрачный фон паузы
    const pauseBackground = new Graphics();
    pauseBackground.fill(0x000000, 0.7);
    pauseBackground.rect(0, 0, this.app.view.width, this.app.view.height);
    pauseBackground.fill();
    this.pauseMenu.addChild(pauseBackground);

    // Текст "PAUSED"
    const pauseTitle = new Text("PAUSED", {
      fontSize: 50,
      fill: 0xffffff,
      align: "center",
    });
    pauseTitle.x = this.app.view.width / 2 - pauseTitle.width / 2;
    pauseTitle.y = this.app.view.height / 2 - 100;
    this.pauseMenu.addChild(pauseTitle);

    // Кнопка "Resume"
    const resumeText = new Text("Resume", {
      fontSize: 30,
      fill: 0xffffff,
      align: "center",
    });
    resumeText.x = this.app.view.width / 2 - resumeText.width / 2;
    resumeText.y = this.app.view.height / 2;
    resumeText.interactive = true;
    resumeText.buttonMode = true;
    resumeText.on("pointerdown", () => this.togglePause());
    this.pauseMenu.addChild(resumeText);

    // Кнопка "Restart"
    const restartText = new Text("Restart", {
      fontSize: 30,
      fill: 0xffffff,
      align: "center",
    });
    restartText.x = this.app.view.width / 2 - restartText.width / 2;
    restartText.y = this.app.view.height / 2 + 50;
    restartText.interactive = true;
    restartText.buttonMode = true;
    restartText.on("pointerdown", () => this.restartGame());
    this.pauseMenu.addChild(restartText);

    this.starBackground = new StarBackground(app);
    this.timer = 60;
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

    if (!this.boss) {
      this.startTimer();
    }

    this.startGameLoop();
  }

  createAsteroids() {
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (this.app.view.width - 150) + 20;
      const y = Math.random() * (this.app.view.height / 2 - 150) + 20;
      this.asteroids.push(new Asteroid(this.app, x, y, this.textures.asteroid));
    }
  }

  shoot() {
    if (this.gameOver) return;

    if (this.bulletCount <= this.maxBullets) {
      const bullet = new Bullet(
        this.app,
        this.player.sprite.x + 55,
        this.player.sprite.y,
        -1
      );
      this.bullets.push(bullet);
      this.bulletCount++;

      // update bullet text
      this.bulletText.text = `Bullets: ${Math.max(
        this.maxBullets - this.bulletCount,
        0
      )}`;

      // warning when last bullet is shot
      if (this.bulletCount === this.maxBullets) {
        const warningText = new Text("Last bullet!", {
          fontSize: 20,
          fill: 0xff0000,
        });
        warningText.x = this.app.view.width / 2 - warningText.width / 2;
        warningText.y = this.app.view.height / 2 - warningText.height / 2;

        this.app.stage.addChild(warningText);

        // reset warning text after 1 second
        setTimeout(() => {
          this.app.stage.removeChild(warningText);
        }, 1000);
      }
    }

    // check if player has no bullets left and no asteroids left
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
    if (this.paused) return;

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

      if (this.boss) {
        const bossBounds = this.boss.sprite.getBounds();

        if (this.isIntersecting(bulletBounds, bossBounds)) {
          this.app.stage.removeChild(bullet.sprite);
          this.bullets.splice(bulletIndex, 1);

          if (this.boss.takeDamage()) {
            this.shatterEffect.create(this.boss.sprite);
            this.app.stage.removeChild(this.boss.sprite);
            this.app.stage.removeChild(this.boss.healthBar);
            this.boss.bullets.forEach((bossBullet) => {
              this.app.stage.removeChild(bossBullet.sprite);
            });
            this.boss.bullets = [];
            this.boss = null;
            this.endGame("YOU WIN");
          }
        }
      }

      if (this.boss) {
        this.boss.bullets.forEach((bossBullet, bossBulletIndex) => {
          const bossBulletBounds = bossBullet.sprite.getBounds();

          if (this.isIntersecting(bulletBounds, bossBulletBounds)) {
            this.app.stage.removeChild(bullet.sprite);
            this.app.stage.removeChild(bossBullet.sprite);
            this.bullets.splice(bulletIndex, 1);
            this.boss.bullets.splice(bossBulletIndex, 1);
          }
        });
      }
    });

    if (this.boss) {
      this.boss.bullets.forEach((bullet, bulletIndex) => {
        const bulletBounds = bullet.sprite.getBounds();
        const playerBounds = this.player.sprite.getBounds();

        if (this.isIntersecting(bulletBounds, playerBounds)) {
          this.app.stage.removeChild(bullet.sprite);
          this.boss.bullets.splice(bulletIndex, 1);

          this.shatterEffect.create(this.player.sprite, 0xffffff);
          this.app.stage.removeChild(this.player.sprite);
          this.endGame("YOU LOSE");
        }
      });
    }
  }

  togglePause() {
    this.paused = !this.paused;
    this.pauseMenu.visible = this.paused;
  }

  restartGame() {
    this.paused = false;
    this.gameOver = false;
    this.pauseMenu.visible = false;
    this.shootCooldown = false; // Сбрасываем задержку выстрелов
    this.app.ticker.start();

    // Очистить пули
    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    this.bullets = [];

    // Очистить астероиды
    this.asteroids.forEach((asteroid) =>
      this.app.stage.removeChild(asteroid.sprite)
    );
    this.asteroids = [];

    // Очистить босса
    if (this.boss) {
      this.app.stage.removeChild(this.boss.sprite);
      this.app.stage.removeChild(this.boss.healthBar);
      this.boss.bullets.forEach((bossBullet) => {
        this.app.stage.removeChild(bossBullet.sprite);
      });
      clearInterval(this.boss.shootingInterval);
      this.boss.destroy();
      this.boss = null;
    }

    // Сбросить счётчики
    this.bulletCount = 0;
    this.maxBullets = 10;
    this.bulletText.text = `Bullets: ${this.maxBullets}`;

    // Уничтожить старого игрока и создать нового
    this.player.destroy(); // Вызываем метод destroy для очистки
    this.app.stage.removeChild(this.player.sprite);
    this.player = new Player(this.app, this, this.textures.player);
    this.app.stage.addChild(this.player.sprite);

    // Создать новые астероиды
    this.createAsteroids();

    // Сбросить таймер
    this.resetTimer();
  }

  goToMainMenu() {
    console.log("Переход в главное меню (реализуется позже)");
    this.restartGame();
  }

  update() {
    if (this.gameOver || this.paused) return;

    this.bullets.forEach((bullet) => bullet.update());
    this.checkCollisions();

    if (this.asteroids.length === 0) {
      if (!this.boss) {
        if (!this.gameOver) {
          this.boss = new Boss(this.app, this.textures.boss);
          this.bulletCount = 0;
          this.maxBullets = 10;

          this.bullets.forEach((bullet) => {
            this.app.stage.removeChild(bullet.sprite);
          });
          this.bullets = [];

          this.bulletText.text = `Bullets: ${this.maxBullets}`;
          this.resetTimer();
        }
      } else {
        this.boss.update();
      }
    }
  }

  endGame(message) {
    this.gameOver = true;

    if (this.boss) {
      clearInterval(this.boss.shootingInterval);
    }

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
      if (!this.gameOver && !this.paused) {
        this.update();
      }
    });
  }

  startTimer() {
    if (this.timer === 0) {
      this.timer = 60;
    }

    this.timerInterval = setInterval(() => {
      if (this.gameOver || this.paused) {
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
