let player = document.getElementById("player");
const ground = document.getElementById("ground");

let obstacles = Array.from(document.getElementsByClassName("obstacle"));

let playerX = 0, playerY = 0, speed = 5;
let isLeftPressed = false, isRightPressed = false;

const gravity = 0.5;
let velocityY = 0;
let velocityX = 0;
const jumpStrength = 10;
let respawnInvulnerable = false;

//spawnpoint
const spawnX = 38;
const spawnY = 500;
let isLoopRunning = false;

function resetPlayer() {
  // This function is now just setting the player pos and states without explosion
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
  }, 1000);  // 1 second invulnerability
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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

/**
 * Unified particle explosion function.
 * mode = "explode" or "reassemble"
 */
function createParticleExplosion(x, y, mode = "explode", onComplete = null) {
  const container = document.getElementById("explosion-container");

  // Clear previous particles
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
    const speed = Math.random() * 5 + 2;

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    if (mode === "explode") {
      particles.push({
        element: particle,
        x: 0,
        y: 0,
        velocityX: vx,
        velocityY: vy,
        life: 60,
        phase: 'explode',
      });
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.transform = `translate(0px, 0px)`;

    } else if (mode === "reassemble") {
      particles.push({
        element: particle,
        x: vx * 30,       // start dispersed
        y: vy * 30,
        velocityX: -vx,   // moving towards center
        velocityY: -vy,
        life: 60,
        phase: 'reassemble',
      });
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.transform = `translate(${vx * 30}px, ${vy * 30}px)`;
    }
  }

  function animate() {
    let allDone = true;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (p.phase === 'explode') {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.velocityY += 0.15;  // gravity effect
        p.life--;
        if (p.life <= 0) {
          p.velocityX = 0;
          p.velocityY = 0;
        } else {
          allDone = false;
        }
      } else if (p.phase === 'reassemble') {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.life--;
        if (p.life > 0) {
          allDone = false;
        }
      }

      p.element.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }

    if (!allDone) {
      requestAnimationFrame(animate);
    } else {
      particles.forEach(p => p.element.remove());
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }

  animate();
}

function checkGoalReached() {
  const playerRect = player.getBoundingClientRect();
  const goal = document.querySelector('.obstacle-goal');
  if (!goal) return false;
  const goalRect = goal.getBoundingClientRect();

  return (
    playerRect.right > goalRect.left &&
    playerRect.left < goalRect.right &&
    playerRect.bottom > goalRect.top &&
    playerRect.top < goalRect.bottom
  );
}

function startNextLevel() {
  ground.innerHTML = ''; // Clear the ground area

  const message = document.createElement('div');
  message.style.color = 'white';
  message.style.textAlign = 'center';
  message.style.paddingTop = '280px';
  message.style.fontSize = '24px';
  message.textContent = 'Level Complete! Loading next level...';
  ground.appendChild(message);

  setTimeout(() => {
    loadLevel2();
  }, 2000);
}

function loadLevel2() {
  ground.innerHTML = '';

  const newPlayer = document.createElement('div');
  newPlayer.id = 'player';
  newPlayer.className = 'player';
  ground.appendChild(newPlayer);

  const obstacleA = document.createElement('div');
  obstacleA.className = 'obstacle';
  obstacleA.style.position = 'absolute';
  obstacleA.style.left = '100px';
  obstacleA.style.top = '550px';
  obstacleA.style.width = '100px';
  obstacleA.style.height = '30px';
  obstacleA.style.backgroundColor = 'gray';
  ground.appendChild(obstacleA);

  const obstacleB = document.createElement('div');
  obstacleB.className = 'obstacle obstacle-goal';
  obstacleB.style.position = 'absolute';
  obstacleB.style.left = '600px';
  obstacleB.style.top = '550px';
  obstacleB.style.width = '100px';
  obstacleB.style.height = '30px';
  obstacleB.style.backgroundColor = 'gold';
  ground.appendChild(obstacleB);

  playerX = 0;
  playerY = 0;
  velocityX = 0;
  velocityY = 0;

  player = document.getElementById('player');

  obstacles.length = 0;
  const newObs = ground.querySelectorAll('.obstacle');
  obstacles.push(...newObs);

  loop();
}

function loop() {
  const groundHeight = ground.clientHeight;
  const playerWidth = player.offsetWidth;
  const playerHeight = player.offsetHeight;
  const maxX = ground.clientWidth - playerWidth;
  const maxY = groundHeight - playerHeight;

  if (isRightPressed) velocityX = speed;
  else if (isLeftPressed) velocityX = -speed;
  else velocityX *= 0.8;

  velocityY += gravity;

  let nextPlayerX = clamp(playerX + velocityX, 0, maxX);
  let nextPlayerY = playerY + velocityY;

  const playerLeft = nextPlayerX;
  const playerRight = nextPlayerX + playerWidth;
  const playerTop = playerY;
  const playerBottom = playerY + playerHeight;

  let collidedOnTop = false;

  for (const obs of obstacles) {
    if(obs.id === "obstacle3") continue;

    const obsTop = obs.offsetTop;
    const obsLeft = obs.offsetLeft;
    const obsRight = obsLeft + obs.offsetWidth;
    const obsBottom = obsTop + obs.offsetHeight;

    if (
      playerBottom <= obsTop &&
      nextPlayerY + playerHeight >= obsTop &&
      playerRight > obsLeft &&
      playerLeft < obsRight &&
      velocityY > 0
    ) {
      nextPlayerY = obsTop - playerHeight;

      if (obs.classList.contains("side-bouncy")) {
        const angleDeg = 20;
        const power = 35;
        const angleRad = angleDeg * (Math.PI / 180);

        velocityX = Math.cos(angleRad) * power;
        velocityY = -Math.sin(angleRad) * power;
      } else if (obs.classList.contains("obstacle-bouncy")) {
        velocityY = -15;
      } else {
        velocityY = 0;
      }

      collidedOnTop = true;
      break;
    }

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

    const isVerticallyAligned =
      nextPlayerY + playerHeight > obsTop &&
      nextPlayerY < obsBottom;

    if (isVerticallyAligned) {
      if (
        isRightPressed &&
        playerX + playerWidth <= obsLeft &&
        nextPlayerX + playerWidth > obsLeft
      ) {
        nextPlayerX = obsLeft - playerWidth;
        velocityX = 0;
      }

      if (
        isLeftPressed &&
        playerX >= obsRight &&
        nextPlayerX < obsRight
      ) {
        nextPlayerX = obsRight;
        velocityX = 0;
      }
    }
  }

  if (nextPlayerY > maxY) {
    nextPlayerY = maxY;
    velocityY = 0;
    collidedOnTop = true;
  }

  // Deadly obstacle collision check
  for (const obs of obstacles) {
    if (!obs.classList.contains("obstacle-dead")) continue;

    const hitbox = obs.querySelector(".hitbox");
    if (!hitbox) continue;

    const hitboxLeft = hitbox.offsetLeft + obs.offsetLeft;
    const hitboxTop = hitbox.offsetTop + obs.offsetTop;
    const hitboxRight = hitboxLeft + hitbox.offsetWidth;
    const hitboxBottom = hitboxTop + hitbox.offsetHeight;

    const playerLeft = playerX;
    const playerRight = playerX + player.offsetWidth;
    const playerTop = playerY;
    const playerBottom = playerY + player.offsetHeight;

    const isColliding =
      playerRight > hitboxLeft &&
      playerLeft < hitboxRight &&
      playerBottom > hitboxTop &&
      playerTop < hitboxBottom;

    if (!respawnInvulnerable && isColliding) {
      console.log("💀 Player hit deadly obstacle!");

      player.style.display = "none";

      const explosionX = playerX + player.offsetWidth / 2;
      const explosionY = playerY + player.offsetHeight / 2;

      // 1. Normal explosion on death
      createParticleExplosion(explosionX, explosionY, "explode", () => {
        // 2. After 500 ms delay, reverse explosion at spawn
        setTimeout(() => {
          const respawnX = spawnX + player.offsetWidth / 2;
          const respawnY = spawnY + player.offsetHeight / 2;

          createParticleExplosion(respawnX, respawnY, "reassemble", () => {
            resetPlayer();
            loop();
          });
        }, 500); // adjust if needed
      });

      return;
    }
  }

  playerX = nextPlayerX;
  playerY = nextPlayerY;

  player.style.left = Math.round(playerX) + "px";
  player.style.top = Math.round(playerY) + "px";

  if (checkGoalReached()) {
    console.log("goal");
    startNextLevel();
    return;
  }

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

resetPlayer();
loop();