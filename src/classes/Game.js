import { Text, Container, Graphics } from "pixi.js";
import { Player } from "./Player.js";
import { Bullet } from "./Bullet.js";
import { Asteroid } from "./Asteroid.js";
import { StarBackground } from "./StarBackground.js";
import { Boss } from "./Boss.js";
import { ShatterEffect } from "./ShatterEffect.js";
import { PauseMenu } from "./PauseMenu.js";
import { RestartButton } from "./RestartButton.js";
import { WallBlock } from "./WallBlock.js";
import { Howl } from "howler";

export class Game {
  constructor(app, textures) {
    this.app = app;
    this.textures = textures;
    this.player = new Player(
      app,
      this,
      textures.player,

    );
    this.sounds = {
      backgroundMusic: new Howl({
        src: ["/assets/backgroundMusic.wav"],
        loop: true,
        volume: 0.5,
      }),
      enemyShoot: new Howl({ src: ["/assets/enemyShoot.wav"], volume: 1.0 }),
      gameOver: new Howl({ src: ["/assets/gameOver.mp3"], volume: 1.0 }),
      start: new Howl({ src: ["/assets/start.mp3"], volume: 1.0 }), // doesnt work
      playerShoot: new Howl({ src: ["/assets/shoot.wav"], volume: 1.0 }),
      destroy: new Howl({ src: ["/assets/explode.wav"], volume: 1.0 }),
      pause: new Howl({ src: ["/assets/select.mp3"], volume: 1.0 }),
      // need enemy shoot sound for boss
      wallBlockDestroy: new Howl({ src: ["/assets/bomb.mp3"], volume: 1.0 }),// for wall enemy doesnt work
    };
    this.shatterEffect = new ShatterEffect(app);
    this.bullets = [];
    this.asteroids = [];
    this.wallBlocks = [];
    this.maxBullets = 10;
    this.bulletCount = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.boss = null;
    this.pauseMenu = new PauseMenu(
      this.app,
      () => this.togglePause(),
      () => this.restartGame()
    );
    this.restartButton = null;

    this.starBackground = new StarBackground(app);
    this.timer = 60;
    this.timerText = new Text(`Время: ${this.timer}`, {
      fontSize: 24,
      fill: 0xffffff,
    });
    this.timerText.x = 10;
    this.timerText.y = 10;
    this.bulletText = new Text(`Пули: ${this.maxBullets}`, {
      fontSize: 24,
      fill: 0xffffff,
    });
    this.bulletText.x = 10;
    this.bulletText.y = 40;

    this.app.stage.addChild(this.timerText);
    this.app.stage.addChild(this.bulletText);
    this.app.stage.addChild(this.pauseMenu.container);
    this.init();
  }

  async init() {
    await this.starBackground.init();

    this.sounds.backgroundMusic.play();

    if (this.level === 1) {
      this.createAsteroids();
    } else if (this.level === 2) {
      this.boss = new Boss(this.app, this.textures.boss, this.sounds);
    } else if (this.level === 3) {
      this.boss = new Boss(this.app, this.textures.boss, this.sounds);
      this.createWall();
    }

    this.startTimer();
    this.startGameLoop();
  }

  createAsteroids() {
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (this.app.view.width - 150) + 20;
      const y = Math.random() * (this.app.view.height / 2 - 150) + 20;
      this.asteroids.push(new Asteroid(this.app, x, y, this.textures.asteroid));
    }
  }

  createWall() {
    this.wallBlocks = [];
    const blockSize = 50;
    const gap = 5;
    const wallHeight = 3;
    const wallWidth = Math.floor(this.app.view.width / (blockSize + gap));
    const startX =
      (this.app.view.width - (wallWidth * (blockSize + gap) - gap)) / 2;
    const startY = this.app.view.height / 2 - 200;

    for (let i = 0; i < wallWidth; i++) {
      for (let j = 0; j < wallHeight; j++) {
        const x = startX + i * (blockSize + gap);
        const y = startY + j * (blockSize + gap);
        const block = new WallBlock(
          this.app,
          x,
          y,
          this.shatterEffect,
          this.sounds.wallBlockDestroy
        );
        this.wallBlocks.push(block);
      }
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

      // Воспроизведение звука выстрела игрока
      this.sounds.playerShoot.play();

      this.bulletText.text = `Пули: ${Math.max(
        this.maxBullets - this.bulletCount,
        0
      )}`;

      if (this.bulletCount === this.maxBullets) {
        const warningText = new Text("Последняя пуля!", {
          fontSize: 20,
          fill: 0xff0000,
        });
        warningText.x = this.app.view.width / 2 - warningText.width / 2;
        warningText.y = this.app.view.height / 2 - warningText.height / 2;

        this.app.stage.addChild(warningText);

        setTimeout(() => {
          this.app.stage.removeChild(warningText);
        }, 1000);
      }
    }

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

      if (this.level === 3) {
        for (let i = this.wallBlocks.length - 1; i >= 0; i--) {
          const block = this.wallBlocks[i];
          const blockBounds = block.sprite.getBounds();
          if (this.isIntersecting(bulletBounds, blockBounds)) {
            this.app.stage.removeChild(bullet.sprite);
            block.destroy();
            this.bullets.splice(bulletIndex, 1);
            this.wallBlocks.splice(i, 1);
            return;
          }
        }
      }

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

            if (this.level === 3) {
              this.endGame("YOU WIN");
            }
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
          this.sounds.destroy.play();
          this.endGame("YOU LOSE");
        }
      });
    }
  }

  togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.pauseMenu.show();
      clearInterval(this.timerInterval);
      this.sounds.backgroundMusic.pause();
      this.sounds.pause.play();
      if (this.boss) {
        this.boss.pause(true); 
      }
    } else {
      this.pauseMenu.hide();
      this.startTimer();
      this.sounds.backgroundMusic.play();
      this.sounds.pause.play();
      if (this.boss) {
        this.boss.pause(false); 
      }
    }
  }

  restartGame() {
    this.paused = false;
    this.gameOver = false;
    this.level = 1;
    this.pauseMenu.hide();
    this.shootCooldown = false;
    this.app.ticker.start();

    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet.sprite));
    this.bullets = [];

    this.asteroids.forEach((asteroid) =>
      this.app.stage.removeChild(asteroid.sprite)
    );
    this.asteroids = [];

    this.wallBlocks.forEach((block) => block.destroy());
    this.wallBlocks = [];

    if (this.boss) {
      this.app.stage.removeChild(this.boss.sprite);
      this.app.stage.removeChild(this.boss.hpBar);
      this.boss.bullets.forEach((bossBullet) => {
        this.app.stage.removeChild(bossBullet.sprite);
      });
      clearInterval(this.boss.shootingInterval);
      this.boss = null;
    }

    if (this.restartButton) {
      this.restartButton.destroy();
      this.restartButton = null;
      // Убрали this.sounds.gameOver.play(), чтобы не было звука при рестарте
    }

    this.app.stage.children.forEach((child) => {
      if (
        child instanceof Text &&
        (child.text === "YOU LOSE" || child.text === "YOU WIN")
      ) {
        this.app.stage.removeChild(child);
      }
    });

    this.bulletCount = 0;
    this.maxBullets = 30;
    this.bulletText.text = `Пули: ${this.maxBullets}`;

    this.player.destroy();
    this.app.stage.removeChild(this.player.sprite);
    this.player = new Player(
      this.app,
      this,
      this.textures.player,
      this.sounds.playerShoot
    );
    this.app.stage.addChild(this.player.sprite);

    this.createAsteroids();
    this.resetTimer();

    this.sounds.backgroundMusic.stop();
    this.sounds.backgroundMusic.play();
  }

  update() {
    if (this.gameOver || this.paused) return;

    this.bullets.forEach((bullet) => bullet.update());
    this.asteroids.forEach((asteroid) => asteroid.update());
    if (this.boss) {
      this.boss.update();
    }
    this.checkCollisions();

    if (this.level === 1 && this.asteroids.length === 0) {
      this.level = 2;
      this.boss = new Boss(this.app, this.textures.boss, this.sounds);
      this.bulletCount = 0;
      this.maxBullets = 30;
      this.timer = 120;
      this.timerText.text = `Время: ${this.timer}`;
      this.bulletText.text = `Пули: ${this.maxBullets}`;
      this.bullets.forEach((bullet) => {
        this.app.stage.removeChild(bullet.sprite);
      });
      this.bullets = [];
      this.resetTimer();
    } else if (this.level === 2 && !this.boss) {
      this.level = 3;
      this.boss = new Boss(this.app, this.textures.boss, this.sounds);
      this.createWall();
      this.bulletCount = 0;
      this.maxBullets = 40;
      this.timer = 150;
      this.timerText.text = `Время: ${this.timer}`;
      this.bulletText.text = `Пули: ${this.maxBullets}`;
      this.bullets.forEach((bullet) => {
        this.app.stage.removeChild(bullet.sprite);
      });
      this.bullets = [];
      this.resetTimer();
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

    this.restartButton = new RestartButton(
      this.app,
      () => this.restartGame(),
      null,
      this.app.view.height / 2 + 50
    );

    this.sounds.backgroundMusic.stop();

    // Проигрываем звук поражения только при "YOU LOSE"
    if (message === "YOU LOSE") {
      this.sounds.gameOver.play();
    }
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
      this.timerText.text = `Время: ${this.timer}`;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.endGame("YOU LOSE");
      }
    }, 1000);
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.timer = this.level === 1 ? 60 : this.level === 2 ? 120 : 150;
    this.timerText.text = `Время: ${this.timer}`;
    this.startTimer();
  }
}
