import { Container, Graphics, Text } from "pixi.js";
import { RestartButton } from "./RestartButton.js";

export class PauseMenu {
  constructor(app, onResume, onRestart) {
    this.app = app;
    this.container = new Container();
    this.container.visible = false;
    // НЕ додаємо контейнер до stage тут - додамо при показі

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
    this.container.addChild(resumeText);    // Кнопка "Restart" через відокремлений клас, але додаємо її до контейнера
    this.restartButton = new RestartButton(this.app, onRestart);
    // Видаляємо кнопку з основного stage та додаємо до нашого контейнера
    this.app.stage.removeChild(this.restartButton.button);
    this.container.addChild(this.restartButton.button);
  }  show() {
    this.container.visible = true;
    // Перевіряємо, чи контейнер вже доданий до stage
    if (!this.app.stage.children.includes(this.container)) {
      this.app.stage.addChild(this.container);
    } else {
      // Якщо вже доданий, переміщуємо на самий верх
      this.app.stage.removeChild(this.container);
      this.app.stage.addChild(this.container);
    }
    // Не потрібно окремо показувати кнопку, вона вже в контейнері
  }

  hide() {
    this.container.visible = false;
    // Не потрібно окремо приховувати кнопку, вона вже в контейнері
  }
}
