import { Sprite } from "pixi.js";

export class Player {
  constructor(app, game, texture) {
    this.app = app;
    this.game = game;

    this.sprite = new Sprite(texture);
    this.sprite.width = 110;
    this.sprite.height = 85;
    this.sprite.x = this.app.view.width / 2 - 25;
    this.sprite.y = this.app.view.height - 90;
    this.app.stage.addChild(this.sprite);
    this.speed = 8;
    this.direction = 0;

    this.update = this.update.bind(this);
    requestAnimationFrame(this.update);

    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  onKeyDown(event) {
    if (this.game.paused) return;

    if (event.key === "ArrowLeft") {
      this.moveLeft();
    } else if (event.key === "ArrowRight") {
      this.moveRight();
    } else if (event.key === " ") {
      this.game.shoot();
    }
  }

  onKeyUp(event) {
    if (this.game.paused) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      this.stop();
    }
  }

  moveLeft() {
    this.direction = -1;
  }

  moveRight() {
    this.direction = 1;
  }

  stop() {
    this.direction = 0;
  }

  update() {
    if (this.direction === -1 && this.sprite.x > 0) {
      this.sprite.x -= this.speed;
    } else if (
      this.direction === 1 &&
      this.sprite.x < this.app.view.width - 50
    ) {
      this.sprite.x += this.speed;
    }
    requestAnimationFrame(this.update);
  }
}
