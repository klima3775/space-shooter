import { Text } from "pixi.js";

export class RestartButton {
  constructor(app, onRestart, x = null, y = null) {
    this.app = app;
    this.onRestart = onRestart;

    this.button = new Text("Restart", {
      fontSize: 30,
      fill: 0xffffff,
      align: "center",
    });

    
    this.button.x = x !== null ? x : app.view.width / 2 - this.button.width / 2;
    this.button.y = y !== null ? y : app.view.height / 2 + 50;

    this.button.interactive = true;
    this.button.buttonMode = true;
    this.button.on("pointerdown", this.onRestart);

    app.stage.addChild(this.button);
  }

  destroy() {
    this.button.off("pointerdown", this.onRestart);
    this.app.stage.removeChild(this.button);
  }

  hide() {
    this.button.visible = false;
  }

  show() {
    this.button.visible = true;
  }
}
