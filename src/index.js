const app = new PIXI.Application({ width: 1280, height: 720 });
document.body.appendChild(app.view);

class Player {
  constructor() {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x66ccff);
    this.sprite.drawRect(0, 0, 50, 50);
    this.sprite.endFill();
    this.sprite.x = app.view.width / 2 - 25;
    this.sprite.y = app.view.height - 60;
    app.stage.addChild(this.sprite);
    this.speed = 40;
  }

  moveLeft() {
    if (this.sprite.x > 0) {
      this.sprite.x -= this.speed;
    }
  }

  moveRight() {
    if (this.sprite.x < app.view.width - 50) {
      this.sprite.x += this.speed;
    }
  }
}

class Bullet {
  constructor(x, y) {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xffffff);
    this.sprite.drawRect(0, 0, 5, 10);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
    app.stage.addChild(this.sprite);
    this.speed = 10;
  }

  update() {
    this.sprite.y -= this.speed;
  }
}

class Asteroid {
  constructor(x, y) {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xff0000);
    this.sprite.drawCircle(0, 0, 20);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
    app.stage.addChild(this.sprite);
  }
}

class Game {
  constructor() {
    this.player = new Player();
    this.bullets = [];
    this.asteroids = [];
    this.maxBullets = 10;
    this.bulletCount = 0;
    this.gameOver = false;
    this.createAsteroids();
    this.setupControls();
    this.startGameLoop();
  }

  createAsteroids() {
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (app.view.width - 40) + 20;
      const y = Math.random() * (app.view.height / 2 - 40) + 20;
      this.asteroids.push(new Asteroid(x, y));
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
  }

  shoot() {
    if (this.bulletCount < this.maxBullets) {
      const bullet = new Bullet(
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
          app.stage.removeChild(bullet.sprite);
          app.stage.removeChild(asteroid.sprite);
          this.bullets.splice(bulletIndex, 1);
          this.asteroids.splice(asteroidIndex, 1);
        }
      });
    });
  }

  update() {
    this.bullets.forEach((bullet) => bullet.update());
    this.checkCollisions();

    if (this.asteroids.length === 0) {
      this.endGame("YOU WIN");
    } else if (
      this.bulletCount >= this.maxBullets &&
      this.bullets.length === 0
    ) {
      this.endGame("YOU LOSE");
    }
  }

  endGame(message) {
    this.gameOver = true;
    const text = new PIXI.Text(message, { fontSize: 50, fill: 0xffffff });
    text.x = app.view.width / 2 - text.width / 2;
    text.y = app.view.height / 2 - text.height / 2;
    app.stage.addChild(text);
  }

  startGameLoop() {
    app.ticker.add(() => {
      if (!this.gameOver) {
        this.update();
      }
    });
  }
}

const game = new Game();
