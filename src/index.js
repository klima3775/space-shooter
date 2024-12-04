import { Application } from "pixi.js";
import { Game } from "./classes/Game.js";

(async () => {
  const app = new Application();

  await app.init({ width: 1280, height: 720 });

  document.body.appendChild(app.canvas);

  const game = new Game(app);
})();
