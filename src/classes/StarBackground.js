import { Container, Sprite, Assets } from "pixi.js";

export class StarBackground {
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
    this.starTexture = await Assets.load("https://pixijs.com/assets/star.png");
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
    if (this.app.paused) return;

    this.cameraZ += time.deltaTime * 10 * this.baseSpeed;
    for (const star of this.stars) {
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
