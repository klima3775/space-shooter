import { Application, Assets, Sprite } from "pixi.js";
import { Game } from "./classes/Game.js";

document.getElementById("startButton").addEventListener("click", async () => {
  document.getElementById("startButton").remove();
  document.getElementById("background").remove();

  const app = new Application();

  await app.init({ width: 1280, height: 720 });

  document.body.appendChild(app.canvas);

  const assets = {
    boss: "assets/boss.png",
    player: "assets/spaceship.png",
    asteroid: "assets/asteroid.png",
  };

  Assets.addBundle("gameAssets", assets);

  const textures = await Assets.loadBundle("gameAssets");

  const game = new Game(app, textures);
});
