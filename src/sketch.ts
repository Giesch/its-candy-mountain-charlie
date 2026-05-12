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

  xRemainder: number;
  yRemainder: number;
  xVelocity: number;
  yVelocity: number;
};

const GRAVITY = 0.5;
const JUMP_VELOCITY = 12;

const sketch = (p: p5) => {
  let player: Player;
  let terrain: BoundingBox[];
  let terrainSpeed = 0.5;

  const playerSize = 20;
  let gameStarted = false;

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);

    player = {
      x: WIDTH / 8,
      y: HEIGHT / 2,
      w: playerSize,
      h: playerSize,

      grounded: false,

      xRemainder: 0,
      yRemainder: 0,
      xVelocity: 0,
      yVelocity: 0,
    };

    const playerFeet = HEIGHT / 2 + player.h;
    terrain = [
      {
        x: 30,
        y: playerFeet + 1,
        w: 55,
        h: 55,
      },
      {
        x: 100,
        y: playerFeet + 20,
        w: 250,
        h: 25,
      },
    ];
  };

  p.draw = () => {
    p.background(26, 26, 46);

    if (!gameStarted) {
      // Show start screen
      p.fill(255);
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Press 1P START", WIDTH / 2, HEIGHT / 2);
      p.textSize(12);
      p.text("Use D-PAD to move", WIDTH / 2, HEIGHT / 2 + 30);

      if (SYSTEM.ONE_PLAYER) {
        gameStarted = true;
      }
      return;
    }

    // UPDATE

    // move terrain
    for (const box of terrain) {
      box.x -= terrainSpeed;
    }

    const STEP_SIZE = 1;

    const movePlayerY = (amount: number, onCollide?: () => void) => {
      player.yRemainder = amount;
      const step = Math.sign(player.yRemainder) * STEP_SIZE;

      while (Math.abs(player.yRemainder) > STEP_SIZE) {
        player.y += step;
        player.yRemainder -= step;

        let collided = false;
        for (const box of terrain) {
          if (collides(player, box)) {
            // hit; rollback and exit
            player.y -= step;
            onCollide?.();
            collided = true;
            break;
          }
        }

        if (collided) break;
      }
    };

    if (player.grounded && PLAYER_1.A) {
      player.yVelocity -= JUMP_VELOCITY;
      player.grounded = false;
    }
    if (!player.grounded) {
      player.yVelocity += GRAVITY;
    }
    movePlayerY(player.yVelocity, () => {
      if (player.yVelocity > 0) {
        player.grounded = true;
        player.yVelocity = 0;
      }
    });

    // Keep player in bounds
    player.x = p.constrain(player.x, 0, WIDTH - player.w);
    player.y = p.constrain(player.y, 0, HEIGHT - player.h);

    // DRAW

    // draw terrain
    p.fill(100, 255, 100);

    for (const box of terrain) {
      p.rect(box.x, box.y, box.w, box.h, 5);
    }

    // draw player (change color when A is pressed)
    if (PLAYER_1.A) {
      p.fill(255, 100, 100);
    } else if (PLAYER_1.B) {
      p.fill(100, 255, 100);
    } else {
      p.fill(100, 200, 255);
    }

    const playerCollidedTerrain = terrain.find((box: BoundingBox) => {
      collides(player, box);
    });

    if (playerCollidedTerrain) {
      p.fill(255, 100, 100);
    }

    p.noStroke();
    p.rect(player.x, player.y, player.w, player.h, 5);
  };
};

new p5(sketch, document.getElementById("sketch")!);
