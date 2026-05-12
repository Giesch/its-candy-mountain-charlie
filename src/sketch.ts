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

const collides = (a: BoundingBox, b: BoundingBox): Boolean => {
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

const sketch = (p: p5) => {
  let playerBB: BoundingBox;

  let terrainBB: BoundingBox;
  let terrainSpeed = 0.5;

  const playerSpeed = 4;
  const playerSize = 20;
  let gameStarted = false;

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);

    playerBB = {
      x: WIDTH / 8,
      y: HEIGHT / 2,
      w: playerSize,
      h: playerSize,
    };

    terrainBB = {
      x: 30,
      y: HEIGHT / 2 + playerBB.h + 1,
      w: 55,
      h: 55,
    };
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
    //terrainBB.x -= terrainSpeed;

    const movePlayerX = (amount: number, onCollide?: () => void) => {
      let remainingX = amount;
      const sign = Math.sign(remainingX);

      while (Math.abs(remainingX) > 1) {
        playerBB.x += sign;
        remainingX -= sign;
        if (collides(playerBB, terrainBB)) {
          // hit; rollback and exit
          playerBB.x -= sign;
          onCollide?.();
          break;
        }
      }
    };

    const movePlayerY = (amount: number, onCollide?: () => void) => {
      let remainingY = amount;
      const sign = Math.sign(remainingY);

      while (Math.abs(remainingY) > 1) {
        playerBB.y += sign;
        remainingY -= sign;
        if (collides(playerBB, terrainBB)) {
          // hit; rollback and exit
          playerBB.y -= sign;
          onCollide?.();
          break;
        }
      }
    };

    // Handle input from arcade controls
    if (PLAYER_1.DPAD.up) {
      movePlayerY(-playerSpeed);
    }
    if (PLAYER_1.DPAD.down) {
      movePlayerY(playerSpeed);
    }
    if (PLAYER_1.DPAD.left) {
      movePlayerX(-playerSpeed);
    }
    if (PLAYER_1.DPAD.right) {
      movePlayerX(playerSpeed);
    }

    // TODO gravity

    // Keep player in bounds
    playerBB.x = p.constrain(playerBB.x, 0, WIDTH - playerBB.w);
    playerBB.y = p.constrain(playerBB.y, 0, HEIGHT - playerBB.h);

    // DRAW

    // draw terrain
    p.fill(100, 255, 100);
    p.rect(terrainBB.x, terrainBB.y, terrainBB.w, terrainBB.h, 5);

    // draw player (change color when A is pressed)
    if (PLAYER_1.A) {
      p.fill(255, 100, 100);
    } else if (PLAYER_1.B) {
      p.fill(100, 255, 100);
    } else {
      p.fill(100, 200, 255);
    }

    if (collides(playerBB, terrainBB)) {
      p.fill(255, 100, 100);
    }

    p.noStroke();
    p.rect(playerBB.x, playerBB.y, playerBB.w, playerBB.h, 5);
  };
};

new p5(sketch, document.getElementById("sketch")!);
