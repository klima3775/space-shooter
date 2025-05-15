import { Application, Assets } from "pixi.js";
import { Game } from "./classes/Game.js";

document.getElementById("startButton").addEventListener("click", async () => {
  document.getElementById("startButton").remove();
  document.getElementById("background").remove();

  const app = new Application();
  await app.init({ width: 1600, height: 900 });
  document.body.appendChild(app.canvas);

  const assets = {
    boss: "assets/boss.png",
    player: "assets/spaceship.png",
    asteroid: "assets/asteroid.png",
  };
  Assets.addBundle("gameAssets", assets);
  const textures = await Assets.loadBundle("gameAssets");

  const game = new Game(app, textures); // Перенесено сюда
  game.sounds.start.play(); // Проигрываем звук старта

  window.addEventListener("keydown", (event) => {
    if (event.key === "p" || event.key === "з") {
      game.togglePause();
    }
  });
});
