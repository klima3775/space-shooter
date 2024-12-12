import { Application, Assets } from "pixi.js";
import { Game } from "./classes/Game.js";
import { Howl } from "howler";

(async () => {
  const app = new Application();

  await app.init({ width: 1280, height: 720 });

  document.body.appendChild(app.canvas);

  const assets = {
    boss: "/src/assets/boss.png",
    player: "/src/assets/spaceship.png",
    asteroid: "/src/assets/asteroid.png",
    // button: "/src/assets/",
    startBackground: "/src/assets/startScreenBackground.png",
  };

  Assets.addBundle("gameAssets", assets);

  const textures = await Assets.loadBundle("gameAssets");

  const game = new Game(app, textures);
})();
