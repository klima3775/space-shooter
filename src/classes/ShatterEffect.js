import { Graphics } from "pixi.js";

export class ShatterEffect {
  constructor(
    app,
    numFragments = 10,
    fragmentSize = { width: 10, height: 10 },
    color = 0xff0000
  ) {
    this.app = app;
    this.numFragments = numFragments;
    this.fragmentSize = fragmentSize;
    this.color = color;
  }

  create(target, color = this.color) {
    const fragments = [];

    for (let i = 0; i < this.numFragments; i++) {
      const fragment = new Graphics();
      fragment.fill(color);
      fragment.rect(0, 0, this.fragmentSize.width, this.fragmentSize.height);
      fragment.fill();

      fragment.x = target.x + Math.random() * target.width;
      fragment.y = target.y + Math.random() * target.height;      fragment.vx = (Math.random() - 0.5) * 16;
      fragment.vy = (Math.random() - 0.5) * 16;

      this.app.stage.addChild(fragment);
      fragments.push(fragment);
    }

    const animation = () => {
      if (this.app.paused) return; // Пропустить анимацию во время паузы

      fragments.forEach((fragment, index) => {        fragment.x += fragment.vx;
        fragment.y += fragment.vy;
        fragment.alpha -= 0.008;

        if (fragment.alpha <= 0) {
          this.app.stage.removeChild(fragment);
          fragments.splice(index, 1);
        }
      });

      if (fragments.length === 0) {
        this.app.ticker.remove(animation);
      }
    };

    this.app.ticker.add(animation);
  }
}
