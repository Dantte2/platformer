let player = document.getElementById("player");
const ground = document.getElementById("ground");

let obstacles = Array.from(document.getElementsByClassName("obstacle"));

let playerX = 0, playerY = 0, speed = 5;
let isLeftPressed = false, isRightPressed = false;

const gravity = 0.5;
let velocityY = 0;
let velocityX = 0;
const jumpStrength = 10;

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

function createExplosion(x, y) {
  const container = document.getElementById("explosion-container");
  const particles = [];
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    container.appendChild(particle);

    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = Math.random() * 5 + 2;

    particles.push({
      element: particle,
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      life: 60, // frames
      opacity: 1,
    });
  }

  function animate() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.velocityY += 0.15; // gravity for particles
      p.life--;
      p.opacity -= 0.02;
      if (p.opacity < 0) p.opacity = 0;

      p.element.style.transform = `translate(${p.x}px, ${p.y}px)`;
      p.element.style.opacity = p.opacity;

      if (p.life <= 0) {
        p.element.remove();
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      requestAnimationFrame(animate);
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

  // Show message
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

  // Create player
  const newPlayer = document.createElement('div');
  newPlayer.id = 'player';
  newPlayer.className = 'player';
  ground.appendChild(newPlayer);

  // Create new obstacles - example positions
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

  // Update global references
  playerX = 0;
  playerY = 0;
  velocityX = 0;
  velocityY = 0;

  // Update player variable to the new element
  player = document.getElementById('player');

  // Update obstacles array
  obstacles.length = 0;
  const newObs = ground.querySelectorAll('.obstacle');
  obstacles.push(...newObs);

  loop(); // restart game loop
}


function loop() {
  const groundHeight = ground.clientHeight;
  const playerWidth = player.offsetWidth;
  const playerHeight = player.offsetHeight;
  const maxX = ground.clientWidth - playerWidth;
  const maxY = groundHeight - playerHeight;

  // === Apply player input to velocityX with friction ===
  if (isRightPressed) velocityX = speed;
  else if (isLeftPressed) velocityX = -speed;
  else velocityX *= 0.8; // friction slows the player when no input

  // === Predict next positions ===
  velocityY += gravity;

  let nextPlayerX = clamp(playerX + velocityX, 0, maxX);
  let nextPlayerY = playerY + velocityY;

  const playerLeft = nextPlayerX;
  const playerRight = nextPlayerX + playerWidth;
  const playerTop = playerY;
  const playerBottom = playerY + playerHeight;

  let collidedOnTop = false;

  for (const obs of obstacles) {
    if(obs.id === "obstacle3"){
      //skip lava collision check
      continue;
    }

    const obsTop = obs.offsetTop;
    const obsLeft = obs.offsetLeft;
    const obsRight = obsLeft + obs.offsetWidth;
    const obsBottom = obsTop + obs.offsetHeight;

    // === Vertical collision: landing on top ===
    if (
      playerBottom <= obsTop &&
      nextPlayerY + playerHeight >= obsTop &&
      playerRight > obsLeft &&
      playerLeft < obsRight &&
      velocityY > 0
    ) {
      nextPlayerY = obsTop - playerHeight;

      if (obs.classList.contains("side-bouncy")) {
        // You can adjust this per obstacle in future using data-angle
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

    // === Hitting head on bottom ===
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

    // === Horizontal collision ===
    const isVerticallyAligned =
      nextPlayerY + playerHeight > obsTop &&
      nextPlayerY < obsBottom;

    if (isVerticallyAligned) {
      // Moving right into left side
      if (
        isRightPressed &&
        playerX + playerWidth <= obsLeft &&
        nextPlayerX + playerWidth > obsLeft
      ) {
        nextPlayerX = obsLeft - playerWidth;
        velocityX = 0;
      }

      // Moving left into right side
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

  // === Floor collision ===
  if (nextPlayerY > maxY) {
    nextPlayerY = maxY;
    velocityY = 0;
    collidedOnTop = true;
  }

  // === Deadly obstacle collision check ===
  const playerRect = player.getBoundingClientRect();

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

  if (isColliding) {
    console.log("💀 Player hit deadly obstacle!");

    player.style.display = "none";
    // Center of the player for explosion position
    const explosionX = playerLeft + player.offsetWidth / 2;
    const explosionY = playerTop + player.offsetHeight / 2;

    createExplosion(explosionX, explosionY);

    setTimeout(() => location.reload(), 1000); 

    return; 
  }
}


  // === Apply new positions ===
  playerX = nextPlayerX;
  playerY = nextPlayerY;

  player.style.left = Math.round(playerX) + "px";
  player.style.top = Math.round(playerY) + "px";

if (checkGoalReached()) {
  console.log("goal");
  startNextLevel();
  return; // stop the loop here
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

loop();