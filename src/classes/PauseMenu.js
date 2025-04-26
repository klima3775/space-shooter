import { Container, Graphics, Text } from "pixi.js";

export class PauseMenu {
  constructor(app, onResume, onRestart) {
    this.app = app;

    // Контейнер для меню паузы
    this.container = new Container();
    this.container.visible = false;
    this.app.stage.addChild(this.container);

    // Полупрозрачный фон
    const background = new Graphics();
    background.beginFill(0x000000, 0.7);
    background.drawRect(0, 0, this.app.view.width, this.app.view.height);
    background.endFill();
    this.container.addChild(background);

    // Текст "PAUSED"
    const pauseTitle = new Text("PAUSED", {
      fontSize: 50,
      fill: 0xffffff,
      align: "center",
    });
    pauseTitle.x = this.app.view.width / 2 - pauseTitle.width / 2;
    pauseTitle.y = this.app.view.height / 2 - 100;
    this.container.addChild(pauseTitle);

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
    resumeText.on("pointerdown", onResume); // Вызываем переданную функцию
    this.container.addChild(resumeText);

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
    restartText.on("pointerdown", onRestart); // Вызываем переданную функцию
    this.container.addChild(restartText);
  }

  show() {
    this.container.visible = true;
  }

  hide() {
    this.container.visible = false;
  }
}
