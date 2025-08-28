let player = document.getElementById("player");
const ground = document.getElementById("ground");
let obstacles = Array.from(document.getElementsByClassName("obstacle"));

let playerX = 0, playerY = 0;
let velocityX = 0, velocityY = 0;
const speed = 200;               // Horizontal speed (pixels/sec)
const gravity = 1500;            // Gravity acceleration (pixels/sec^2)
const jumpStrength = 600;        // Jump impulse (pixels/sec)
let isLeftPressed = false, isRightPressed = false;
let respawnInvulnerable = false;

const spawnX = 38, spawnY = 500; // Player spawn position
let lastTime = performance.now();

// Reset player position & state; start respawn invulnerability timer
function resetPlayer() {
  playerX = spawnX;
  playerY = spawnY;
  velocityX = 0;
  velocityY = 0;
  player.style.left = playerX + "px";
  player.style.top = playerY + "px";
  player.style.display = "block";
  isLeftPressed = false;
  isRightPressed = false;
  respawnInvulnerable = true;
  setTimeout(() => {
    respawnInvulnerable = false;
  }, 1000); // 1 sec invulnerability
}

// Clamp a value between min and max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Check if player is on the ground or standing on any obstacle (for jumping)
function isOnGroundOrObstacle() {
  const playerBottom = playerY + player.offsetHeight;
  const groundTop = ground.clientHeight;

  if (playerBottom >= groundTop - 1) {
    return true;
  }

  for (const obs of obstacles) {
    const obsTop = obs.offsetTop;
    const obsLeft = obs.offsetLeft;
    const obsRight = obsLeft + obs.offsetWidth;

    if (
      playerBottom >= obsTop - 5 &&
      playerBottom <= obsTop + 5 &&
      playerX + player.offsetWidth > obsLeft &&
      playerX < obsRight
    ) {
      return true;
    }
  }

  return false;
}

// Particle explosion animation (explode or reassemble)
function createParticleExplosion(x, y, mode = "explode", onComplete = null) {
  const container = document.getElementById("explosion-container");

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const particles = [];
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    container.appendChild(particle);

    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = Math.random() * 150 + 50;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    if (mode === "explode") {
      particles.push({
        element: particle,
        x: 0,
        y: 0,
        velocityX: vx,
        velocityY: vy,
        life: 1,
        phase: "explode",
      });
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.transform = `translate(0px, 0px)`;
    } else if (mode === "reassemble") {
      particles.push({
        element: particle,
        x: vx * 0.6,
        y: vy * 0.6,
        velocityX: -vx,
        velocityY: -vy,
        life: 1,
        phase: "reassemble",
      });
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.transform = `translate(${vx * 0.6}px, ${vy * 0.6}px)`;
    }
  }

  let lastParticleTime = performance.now();

  function animate() {
    const now = performance.now();
    const deltaTime = (now - lastParticleTime) / 1000;
    lastParticleTime = now;

    let allDone = true;

    for (const p of particles) {
      if (p.phase === "explode") {
        p.x += p.velocityX * deltaTime;
        p.y += p.velocityY * deltaTime;
        p.velocityY += 300 * deltaTime; // Particle gravity
        p.life -= deltaTime;
        if (p.life > 0) {
          allDone = false;
        } else {
          p.velocityX = 0;
          p.velocityY = 0;
        }
      } else if (p.phase === "reassemble") {
        p.x += p.velocityX * deltaTime;
        p.y += p.velocityY * deltaTime;
        p.life -= deltaTime;
        if (p.life > 0) {
          allDone = false;
        }
      }
      p.element.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }

    if (!allDone) {
      requestAnimationFrame(animate);
    } else {
      particles.forEach((p) => p.element.remove());
      if (typeof onComplete === "function") {
        onComplete();
      }
    }
  }

  animate();
}

// Check if player overlaps the goal
function checkGoalReached() {
  const playerRect = player.getBoundingClientRect();
  const goal = document.querySelector(".obstacle-goal");

  if (!goal) {
    return false;
  }

  const goalRect = goal.getBoundingClientRect();

  return (
    playerRect.right > goalRect.left &&
    playerRect.left < goalRect.right &&
    playerRect.bottom > goalRect.top &&
    playerRect.top < goalRect.bottom
  );
}

// Show "Level Complete" and load level 2 after delay
function startNextLevel() {
  ground.innerHTML = "";

  const message = document.createElement("div");
  message.style = "color:white;text-align:center;padding-top:280px;font-size:24px;";
  message.textContent = "Level Complete! Loading next level...";
  ground.appendChild(message);

  setTimeout(loadLevel2, 2000);
}

// Load level 2 setup (player + obstacles)
function loadLevel2() {
  ground.innerHTML = "";

  const newPlayer = document.createElement("div");
  newPlayer.id = "player";
  newPlayer.className = "player";
  ground.appendChild(newPlayer);

  const obstacleA = document.createElement("div");
  obstacleA.className = "obstacle";
  Object.assign(obstacleA.style, {
    position: "absolute",
    left: "100px",
    top: "550px",
    width: "100px",
    height: "30px",
    backgroundColor: "gray",
  });
  ground.appendChild(obstacleA);

  const obstacleB = document.createElement("div");
  obstacleB.className = "obstacle obstacle-goal";
  Object.assign(obstacleB.style, {
    position: "absolute",
    left: "600px",
    top: "550px",
    width: "100px",
    height: "30px",
    backgroundColor: "gold",
  });
  ground.appendChild(obstacleB);

  playerX = 0;
  playerY = 0;
  velocityX = 0;
  velocityY = 0;
  player = document.getElementById("player");

  obstacles.length = 0;
  obstacles.push(...ground.querySelectorAll(".obstacle"));

  lastTime = performance.now();
  requestAnimationFrame(loop);
}

// Main game loop: update positions, handle collisions, input, goal checks
function loop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  const groundHeight = ground.clientHeight;
  const playerWidth = player.offsetWidth;
  const playerHeight = player.offsetHeight;
  const maxX = ground.clientWidth - playerWidth;
  const maxY = groundHeight - playerHeight;

  // Handle horizontal input and apply friction when no input
  if (isRightPressed) {
    velocityX = speed;
  } else if (isLeftPressed) {
    velocityX = -speed;
  } else {
    velocityX *= Math.pow(0.8, deltaTime * 60); // damping
  }

  // Apply gravity vertically
  velocityY += gravity * deltaTime;

  let nextPlayerX = clamp(playerX + velocityX * deltaTime, 0, maxX);
  let nextPlayerY = playerY + velocityY * deltaTime;

  const playerLeft = nextPlayerX;
  const playerRight = nextPlayerX + playerWidth;
  const playerTop = playerY;
  const playerBottom = playerY + playerHeight;

  let collidedOnTop = false;

  // Collision detection with obstacles
  for (const obs of obstacles) {
    if (obs.id === "obstacle3") continue;

    const obsTop = obs.offsetTop;
    const obsLeft = obs.offsetLeft;
    const obsRight = obsLeft + obs.offsetWidth;
    const obsBottom = obsTop + obs.offsetHeight;

    // Collision from above (landing)
    if (
      playerBottom <= obsTop &&
      nextPlayerY + playerHeight >= obsTop &&
      playerRight > obsLeft &&
      playerLeft < obsRight &&
      velocityY > 0
    ) {
      nextPlayerY = obsTop - playerHeight;

      // Special bouncy platform behaviors
      if (obs.classList.contains("side-bouncy")) {
        const angleRad = (35 * Math.PI) / 180;
        const power = 1200;
        velocityX = Math.cos(angleRad) * power;
        velocityY = -Math.sin(angleRad) * power;
      } else if (obs.classList.contains("obstacle-bouncy")) {
        velocityY = -600;
      } else {
        velocityY = 0;
      }

      collidedOnTop = true;
      break;
    }

    // Collision from below (head bump)
    if (
      playerTop >= obsBottom &&
      nextPlayerY <= obsBottom &&
      playerRight > obsLeft &&
      playerLeft < obsRight &&
      velocityY < 0
    ) {
      velocityY = 0;
      nextPlayerY = obsBottom;
      break;
    }

    // Horizontal collisions (walls)
    const verticallyAligned = nextPlayerY + playerHeight > obsTop && nextPlayerY < obsBottom;

    if (verticallyAligned) {
      if (isRightPressed && playerX + playerWidth <= obsLeft && nextPlayerX + playerWidth > obsLeft) {
        nextPlayerX = obsLeft - playerWidth;
        velocityX = 0;
      }

      if (isLeftPressed && playerX >= obsRight && nextPlayerX < obsRight) {
        nextPlayerX = obsRight;
        velocityX = 0;
      }
    }
  }

  // Ground collision clamp
  if (nextPlayerY > maxY) {
    nextPlayerY = maxY;
    velocityY = 0;
    collidedOnTop = true;
  }

  // Check collision with deadly obstacles (with hitbox)
  for (const obs of obstacles) {
    if (!obs.classList.contains("obstacle-dead")) continue;

    const hitbox = obs.querySelector(".hitbox");
    if (!hitbox) continue;

    const hitboxLeft = hitbox.offsetLeft + obs.offsetLeft;
    const hitboxTop = hitbox.offsetTop + obs.offsetTop;
    const hitboxRight = hitboxLeft + hitbox.offsetWidth;
    const hitboxBottom = hitboxTop + hitbox.offsetHeight;

    const playerLeftNow = playerX;
    const playerRightNow = playerX + player.offsetWidth;
    const playerTopNow = playerY;
    const playerBottomNow = playerY + player.offsetHeight;

    const isColliding =
      playerRightNow > hitboxLeft &&
      playerLeftNow < hitboxRight &&
      playerBottomNow > hitboxTop &&
      playerTopNow < hitboxBottom;

    if (!respawnInvulnerable && isColliding) {
      // Player death: hide, explode, respawn with animation
      player.style.display = "none";

      const explosionX = playerX + player.offsetWidth / 2;
      const explosionY = playerY + player.offsetHeight / 2;

      createParticleExplosion(explosionX, explosionY, "explode", () => {
        setTimeout(() => {
          const respawnX = spawnX + player.offsetWidth / 2;
          const respawnY = spawnY + player.offsetHeight / 2;

          createParticleExplosion(respawnX, respawnY, "reassemble", () => {
            resetPlayer();
            lastTime = performance.now();
            requestAnimationFrame(loop);
          });
        }, 500); // respawn delay
      });

      return; // Stop the loop until respawn completes
    }
  }

  // Update player position
  playerX = nextPlayerX;
  playerY = nextPlayerY;
  player.style.left = Math.round(playerX) + "px";
  player.style.top = Math.round(playerY) + "px";

  // Check for level completion
  if (checkGoalReached()) {
    startNextLevel();
    return;
  }

  requestAnimationFrame(loop);
}

// Input handling
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    isRightPressed = true;
  }
  if (e.key === "ArrowLeft") {
    isLeftPressed = true;
  }
  if (e.key === "ArrowUp" && isOnGroundOrObstacle()) {
    velocityY = -jumpStrength;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") {
    isRightPressed = false;
  }
  if (e.key === "ArrowLeft") {
    isLeftPressed = false;
  }
});

// Initialize player and start loop
resetPlayer();
requestAnimationFrame(loop);