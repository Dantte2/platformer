const player = document.getElementById("player");
const ground = document.getElementById("ground");

// Collect all obstacles dynamically from the DOM by class
const obstacles = Array.from(document.getElementsByClassName("obstacle"));

let playerX = 0, playerY = 0, speed = 5;
let isLeftPressed = false, isRightPressed = false;

const gravity = 0.5;
let velocityY = 0;
const jumpStrength = 10;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isOnGroundOrObstacle() {
  const playerBottom = playerY + player.offsetHeight;
  const groundTop = ground.clientHeight;

  // Check if on ground (within 1 pixel tolerance)
  if (playerBottom >= groundTop - 1) {
    return true;
  }

  // Check all obstacles if player is "standing" on them with a little margin (5px)
  for (const obs of obstacles) {
    const obsTop = obs.offsetTop;
    const obsLeft = obs.offsetLeft;
    const obsRight = obsLeft + obs.offsetWidth;

    if (
      playerBottom >= obsTop - 5 &&  // Allow standing slightly above obstacle top
      playerBottom <= obsTop + 5 &&  // And not too far below
      playerX + player.offsetWidth > obsLeft &&
      playerX < obsRight
    ) {
      return true;
    }
  }

  return false;
}

function loop() {
  const groundHeight = ground.clientHeight;
  const playerWidth = player.offsetWidth;
  const playerHeight = player.offsetHeight;
  const maxX = ground.clientWidth - playerWidth;
  const maxY = groundHeight - playerHeight;

  // Apply horizontal movement
  if (isRightPressed) playerX = clamp(playerX + speed, 0, maxX);
  if (isLeftPressed) playerX = clamp(playerX - speed, 0, maxX);

  // Apply gravity
  velocityY += gravity;
  let nextPlayerY = playerY + velocityY;

  // Player rectangle for collision
  const playerLeft = playerX;
  const playerRight = playerX + playerWidth;

  // First, check collision with all obstacles
  let collidedOnTop = false;
  for (const obs of obstacles) {
    const obsTop = obs.offsetTop;
    const obsLeft = obs.offsetLeft;
    const obsRight = obsLeft + obs.offsetWidth;
    const obsBottom = obsTop + obs.offsetHeight;

    // Landing on top
    if (
      playerY + playerHeight <= obsTop &&
      nextPlayerY + playerHeight >= obsTop &&
      playerRight > obsLeft &&
      playerLeft < obsRight &&
      velocityY > 0
    ) {
      nextPlayerY = obsTop - playerHeight;
      velocityY = 0;
      collidedOnTop = true;
      break;  // Stop checking further obstacles once landed on one
    }

    // Hitting underside of obstacle (head bump)
    if (
      playerY >= obsBottom &&
      nextPlayerY <= obsBottom &&
      playerRight > obsLeft &&
      playerLeft < obsRight &&
      velocityY < 0
    ) {
      velocityY = 0;
      nextPlayerY = obsBottom;
      break;
    }
  }

  // Floor collision
  if (nextPlayerY > maxY) {
    nextPlayerY = maxY;
    velocityY = 0;
    collidedOnTop = true;
  }

  playerY = nextPlayerY;

  // Update position
  player.style.left = Math.round(playerX) + "px";
  player.style.top = Math.round(playerY) + "px";

  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") isRightPressed = true;
  if (e.key === "ArrowLeft") isLeftPressed = true;
  if (e.key === "ArrowUp") {
    if (isOnGroundOrObstacle()) {
      velocityY = -jumpStrength;
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") isRightPressed = false;
  if (e.key === "ArrowLeft") isLeftPressed = false;
});

loop();
