import p5 from "p5";
import { PLAYER_1, SYSTEM } from "@rcade/plugin-input-classic";

// Rcade game dimensions
const WIDTH = 336;
const HEIGHT = 262;

const sketch = (p: p5) => {
  let ballX: number;
  let ballY: number;

  let terrainX: number;
  let terrainY: number;
  let terrainSpeed = 0.5;

  const ballSpeed = 4;
  const ballSize = 20;
  let gameStarted = false;

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
    ballX = WIDTH / 8;
    ballY = HEIGHT / 2;
    terrainX = 30;
    terrainY = HEIGHT / 2 + ballSize / 2;
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
    terrainX -= terrainSpeed;

    // Handle input from arcade controls
    if (PLAYER_1.DPAD.up) {
      ballY -= ballSpeed;
    }
    if (PLAYER_1.DPAD.down) {
      ballY += ballSpeed;
    }
    if (PLAYER_1.DPAD.left) {
      ballX -= ballSpeed;
    }
    if (PLAYER_1.DPAD.right) {
      ballX += ballSpeed;
    }

    // Keep ball in bounds
    ballX = p.constrain(ballX, ballSize / 2, WIDTH - ballSize / 2);
    ballY = p.constrain(ballY, ballSize / 2, HEIGHT - ballSize / 2);

    // DRAW

    // draw terrain
    p.fill(100, 255, 100);
    p.rect(terrainX, terrainY, 55, 55, 5);

    // draw ball (change color when A is pressed)
    if (PLAYER_1.A) {
      p.fill(255, 100, 100);
    } else if (PLAYER_1.B) {
      p.fill(100, 255, 100);
    } else {
      p.fill(100, 200, 255);
    }
    p.noStroke();
    p.ellipse(ballX, ballY, ballSize, ballSize);
  };
};

new p5(sketch, document.getElementById("sketch")!);
