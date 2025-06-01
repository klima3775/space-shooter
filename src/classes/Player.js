import { Sprite } from "pixi.js";

export class Player {
  constructor(app, game, texture) {
    this.app = app;
    this.game = game;

    this.sprite = new Sprite(texture);
    this.sprite.width = 110;
    this.sprite.height = 85;
    this.sprite.x = this.app.view.width / 2 - 25;
    this.sprite.y = this.app.view.height - 90;    this.app.stage.addChild(this.sprite);
    this.speed = 12;
    this.direction = 0;
    this.animationFrameId = null; // Для хранения ID анимационного цикла

    // Привязываем методы
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.update = this.update.bind(this);

    // Добавляем слушатели событий
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    // Запускаем анимационный цикл
    this.animationFrameId = requestAnimationFrame(this.update);
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
    if (this.game.paused) {
      this.animationFrameId = requestAnimationFrame(this.update);
      return;
    }

    if (this.direction === -1 && this.sprite.x > 0) {
      this.sprite.x -= this.speed;
    } else if (
      this.direction === 1 &&
      this.sprite.x < this.app.view.width - 100
    ) {
      this.sprite.x += this.speed;
    }
    this.animationFrameId = requestAnimationFrame(this.update);
  }

  destroy() {
    // Удаляем слушатели событий
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);

    // Останавливаем анимационный цикл
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Удаляем спрайт
    this.app.stage.removeChild(this.sprite);
  }
}
