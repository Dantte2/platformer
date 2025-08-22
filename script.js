const player = document.getElementById("player");
const ground = document.getElementById("ground");
const obstacle = document.getElementById("obstacle");

let playerX = 0, playerY = 0, speed = 5;
let isLeftPressed = false, isRightPressed = false, isDownPressed = false, isUpPressed = false;

const gravity = 0.5;
let velocityY = 0;
const jumpStrength = 10;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isColliding(r1, r2) {
  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

function getMaxY() {
  return ground.clientHeight - player.offsetHeight;
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

    // Get obstacle and positions
    const obstacleTop = obstacle.offsetTop;
    const obstacleLeft = obstacle.offsetLeft;
    const obstacleRight = obstacleLeft + obstacle.offsetWidth;
    const obstacleBottom = obstacleTop + obstacle.offsetHeight;

    const playerLeft = playerX;
    const playerRight = playerX + playerWidth;
    const nextPlayerBottom = nextPlayerY + playerHeight;

    const isAboveObstacle =
        playerY + playerHeight <= obstacleTop &&
        nextPlayerBottom >= obstacleTop &&
        playerRight > obstacleLeft &&
        playerLeft < obstacleRight &&
        velocityY > 0;

    if (isAboveObstacle) {
        // Stop falling exactly on top of obstacle
        playerY = obstacleTop - playerHeight;
        velocityY = 0;
    } else {
        // Normal fall
        playerY = nextPlayerY;
    }

    // Floor collision
    if (playerY > maxY) {
        playerY = maxY;
        velocityY = 0;
    }

    // Update position
    player.style.left = Math.round(playerX) + "px";
    player.style.top = Math.round(playerY) + "px";

    requestAnimationFrame(loop);
}

function isOnGroundOrObstacle() {
    const playerBottom = playerY + player.offsetHeight;
    const onGround = Math.abs(playerBottom - ground.clientHeight) < 1;

    const obstacleTop = obstacle.offsetTop;
    const obstacleLeft = obstacle.offsetLeft;
    const obstacleRight = obstacleLeft + obstacle.offsetWidth;

    const onObstacle =
        Math.abs(playerBottom - obstacleTop) < 1 &&
        playerX + player.offsetWidth > obstacleLeft &&
        playerX < obstacleRight;

    return onGround || onObstacle;
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") isRightPressed = true;
    if (e.key === "ArrowLeft") isLeftPressed = true;
    if (e.key === "ArrowDown") isDownPressed = true;
    if (e.key === "ArrowUp") {
        if (isOnGroundOrObstacle()) {
            velocityY = -jumpStrength;
        }
    }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") isRightPressed = false;
  if (e.key === "ArrowLeft") isLeftPressed = false;
  if (e.key === "ArrowDown") isDownPressed = false;
  if (e.key === "ArrowUp") isUpPressed = false;
});

loop();