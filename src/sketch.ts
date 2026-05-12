import p5 from "p5";
import { PLAYER_1, SYSTEM } from "@rcade/plugin-input-classic";

// Rcade game dimensions
const WIDTH = 336;
const HEIGHT = 262;

type BoundingBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const collides = (a: BoundingBox, b: BoundingBox): boolean => {
  let aBottom = a.y;
  let aTop = a.y + a.h;
  let aLeft = a.x;
  let aRight = a.x + a.w;

  let bBottom = b.y;
  let bTop = b.y + b.w;
  let bLeft = b.x;
  let bRight = b.x + b.w;

  let vertOverlap =
    (aBottom < bTop && aBottom > bBottom) || (aTop > bBottom && aTop < bTop);
  let horzOverlap =
    (aLeft < bRight && aLeft > bLeft) || (aRight > bLeft && aRight < bRight);

  return vertOverlap && horzOverlap;
};

type Player = {
  x: number;
  y: number;
  w: number;
  h: number;

  grounded: boolean;
  ded: boolean;

  xRemainder: number;
  yRemainder: number;
  xVelocity: number;
  yVelocity: number;
};

const GRAVITY = 0.5;
const JUMP_VELOCITY = 12;

class Game {
  player: Player;
  terrain: BoundingBox[];
  started: boolean;

  constructor() {
    this.started = false;

    this.player = {
      x: WIDTH / 8,
      y: HEIGHT / 2,
      w: 20,
      h: 20,

      grounded: false,
      ded: false,

      xRemainder: 0,
      yRemainder: 0,
      xVelocity: 0,
      yVelocity: 0,
    };

    const playerFeet = HEIGHT / 2 + this.player.h;
    this.terrain = [
      {
        x: 30,
        y: playerFeet + 1,
        w: 55,
        h: 55,
      },
      {
        x: 200,
        y: playerFeet + 20,
        w: 250,
        h: 25,
      },
    ];
  }

  update(p: p5) {
    if (!this.started) {
      return;
    }

    if (this.player.ded) {
      return;
    }

    let terrainSpeed = 0.5;
    // move terrain
    for (const box of this.terrain) {
      box.x -= terrainSpeed;
    }

    const STEP_SIZE = 1;
    let playerCopy = structuredClone(this.player);
    playerCopy.y += STEP_SIZE;

    this.player.grounded = !! this.terrain.find((box: BoundingBox) => {
      collides(playerCopy, box);
    });

    const movePlayerY = (amount: number, onCollide?: () => void) => {
      this.player.yRemainder = amount;
      const step = Math.sign(this.player.yRemainder) * STEP_SIZE;

      while (Math.abs(this.player.yRemainder) > STEP_SIZE) {
        this.player.y += step;
        this.player.yRemainder -= step;

        let collided = false;
        for (const box of this.terrain) {
          if (collides(this.player, box)) {
            // hit; rollback and exit
            this.player.y -= step;
            onCollide?.();
            collided = true;
            break;
          }
        }

        if (collided) break;
      }
    };

    if (this.player.grounded && PLAYER_1.A) {
      this.player.yVelocity -= JUMP_VELOCITY;
      this.player.grounded = false;
    }
    if (!this.player.grounded) {
      this.player.yVelocity += GRAVITY;
    }
    movePlayerY(this.player.yVelocity, () => {
      if (this.player.yVelocity > 0) {
        this.player.grounded = true;
        this.player.yVelocity = 0;
      }
    });

    if (this.player.y > HEIGHT - this.player.h) {
      this.player.ded = true;
    }

    // Keep player in bounds
    this.player.x = p.constrain(this.player.x, 0, WIDTH - this.player.w);
    this.player.y = p.constrain(this.player.y, 0, HEIGHT - this.player.h);
  }

  draw(p: p5) {
    if (!this.started) {
      // Show start screen
      p.fill(255);
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Press 1P START", WIDTH / 2, HEIGHT / 2);
      p.textSize(12);
      p.text("Use D-PAD to move", WIDTH / 2, HEIGHT / 2 + 30);

      if (SYSTEM.ONE_PLAYER) {
        this.started = true;
      }
      return;
    }

    // draw terrain
    p.fill(100, 255, 100);

    for (const box of this.terrain) {
      p.rect(box.x, box.y, box.w, box.h, 5);
    }

    // draw player (change color when A is pressed)
    if (PLAYER_1.A || this.player.ded) {
      p.fill(255, 100, 100);
    } else if (PLAYER_1.B) {
      p.fill(100, 255, 100);
    } else {
      p.fill(100, 200, 255);
    }

    const playerCollidedTerrain = this.terrain.find((box: BoundingBox) => {
      collides(this.player, box);
    });

    if (playerCollidedTerrain) {
      p.fill(255, 100, 100);
    }

    p.noStroke();
    p.rect(this.player.x, this.player.y, this.player.w, this.player.h, 5);
  }
}

const sketch = (p: p5) => {
  let game: Game;

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
    game = new Game();
  };

  p.draw = () => {
    p.background(26, 26, 46);

    game.update(p);
    game.draw(p);
  };
};

new p5(sketch, document.getElementById("sketch")!);
