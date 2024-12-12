import { Application, Assets } from "pixi.js";
import { Game } from "./classes/Game.js";

(async () => {
  const app = new Application();

  await app.init({ width: 1280, height: 720 });

  document.body.appendChild(app.canvas);

  const assets = {
    boss: "/src/assets/boss.png",
    player: "/src/assets/spaceship.png",
    asteroid: "/src/assets/asteroid.png",
  };

  Assets.addBundle("gameAssets", assets);

  const textures = await Assets.loadBundle("gameAssets");

  const game = new Game(app, textures);
})();
