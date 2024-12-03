import {
  Application,
  Assets,
  Sprite,
  Container,
  Graphics,
  Text,
} from "pixi.js";

(async () => {
  // Create the application
  const app = new Application();

  // Initialize the application
  await app.init({ width: 800, height: 600 });

  // Add the view to the DOM
  document.body.appendChild(app.canvas);

  class StarBackground {
    constructor(app) {
      this.app = app;
      this.starContainer = new Container();
      this.app.stage.addChild(this.starContainer);
      this.starTexture = null;
      this.stars = [];
      this.starAmount = 1000;
      this.cameraZ = 0;
      this.fov = 20;
      this.baseSpeed = 0.025;
      this.starStretch = 5;
      this.starBaseSize = 0.05;
    }

    async init() {
      this.starTexture = await Assets.load(
        "https://pixijs.com/assets/star.png"
      );
      this.createStars();
      this.app.ticker.add((time) => this.update(time));
    }

    createStars() {
      for (let i = 0; i < this.starAmount; i++) {
        const star = {
          sprite: new Sprite(this.starTexture),
          z: 0,
          x: 0,
          y: 0,
        };

        star.sprite.anchor.x = 0.5;
        star.sprite.anchor.y = 0.7;
        this.randomizeStar(star, true);
        this.starContainer.addChild(star.sprite);
        this.stars.push(star);
      }
    }

    randomizeStar(star, initial) {
      star.z = initial
        ? Math.random() * 2000
        : this.cameraZ + Math.random() * 1000 + 2000;

      const deg = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50 + 1;

      star.x = Math.cos(deg) * distance;
      star.y = Math.sin(deg) * distance;
    }

    update(time) {
      this.cameraZ += time.deltaTime * 10 * this.baseSpeed;
      for (let i = 0; i < this.starAmount; i++) {
        const star = this.stars[i];

        if (star.z < this.cameraZ) this.randomizeStar(star);

        const z = star.z - this.cameraZ;

        star.sprite.x =
          star.x * (this.fov / z) * this.app.renderer.screen.width +
          this.app.renderer.screen.width / 2;
        star.sprite.y =
          star.y * (this.fov / z) * this.app.renderer.screen.width +
          this.app.renderer.screen.height / 2;

        const dxCenter = star.sprite.x - this.app.renderer.screen.width / 2;
        const dyCenter = star.sprite.y - this.app.renderer.screen.height / 2;
        const distanceCenter = Math.sqrt(
          dxCenter * dxCenter + dyCenter * dyCenter
        );
        const distanceScale = Math.max(0, (2000 - z) / 2000);

        star.sprite.scale.x = distanceScale * this.starBaseSize;
        star.sprite.scale.y =
          distanceScale * this.starBaseSize +
          (distanceScale * this.baseSpeed * this.starStretch * distanceCenter) /
            this.app.renderer.screen.width;
        star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
      }
    }
  }

  class Player {
    constructor() {
      this.sprite = new Graphics();
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
      this.sprite = new Graphics();
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
      this.sprite = new Graphics();
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
      this.starBackground = new StarBackground(app);
      this.init();
    }

    async init() {
      await this.starBackground.init();
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
      const text = new Text(message, { fontSize: 50, fill: 0xffffff });
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
})();
