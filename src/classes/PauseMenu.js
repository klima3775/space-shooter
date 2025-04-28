import { Container, Graphics, Text } from "pixi.js";
import { RestartButton } from "./RestartButton.js";

export class PauseMenu {
  constructor(app, onResume, onRestart) {
    this.app = app;
    this.container = new Container();
    this.container.visible = false;
    this.app.stage.addChild(this.container);

    const background = new Graphics();
    background.beginFill(0x000000, 0.7);
    background.drawRect(0, 0, this.app.view.width, this.app.view.height);
    background.endFill();
    this.container.addChild(background);

    const pauseTitle = new Text("PAUSED", {
      fontSize: 50,
      fill: 0xffffff,
      align: "center",
    });
    pauseTitle.x = this.app.view.width / 2 - pauseTitle.width / 2;
    pauseTitle.y = this.app.view.height / 2 - 100;
    this.container.addChild(pauseTitle);

    const resumeText = new Text("Resume", {
      fontSize: 30,
      fill: 0xffffff,
      align: "center",
    });
    resumeText.x = this.app.view.width / 2 - resumeText.width / 2;
    resumeText.y = this.app.view.height / 2;
    resumeText.interactive = true;
    resumeText.buttonMode = true;
    resumeText.on("pointerdown", onResume);
    this.container.addChild(resumeText);

    // Кнопка "Restart" через отдельный класс
    this.restartButton = new RestartButton(this.app, onRestart);
    this.container.addChild(this.restartButton.button);
  }

  show() {
    this.container.visible = true;
    this.restartButton.show();
  }

  hide() {
    this.container.visible = false;
    this.restartButton.hide();
  }
}
