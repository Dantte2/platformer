const player = document.getElementById("player");

let playerX = 0;
let playerY = 0;
let speed = 5;

let isDownPressed = false;
let isLeftPressed = false;
let isRightPressed = false;
let isUpPressed = false;

function loop (){
    if(isRightPressed){
        playerX += speed;
        player.style.left = playerX + 'px'
    }
    if(isLeftPressed){
        playerX -= speed;
        player.style.left = playerX + 'px';
    }
    if(isDownPressed){
        playerY += speed;
        player.style.top = playerY + 'px';
    }
    if(isUpPressed){
        playerY -= speed;
        player.style.top = playerY + 'px';
    }
    requestAnimationFrame(loop);
}


document.addEventListener('keydown', (event) =>{
    if(event.key === 'ArrowRight'){
      isRightPressed = true;
    }
});

document.addEventListener('keyup', (event) =>{
    if(event.key === 'ArrowRight'){
        isRightPressed = false;
    }
});

document.addEventListener('keydown', (event) =>{
    if(event.key === 'ArrowLeft'){
        isLeftPressed = true;
    }
});

document.addEventListener('keyup', (event) =>{
    if(event.key === 'ArrowLeft'){
        isLeftPressed = false;
    }
});

document.addEventListener('keydown', (event) =>{
    if(event.key === 'ArrowDown'){
        isDownPressed = true;
    }
});

document.addEventListener('keyup', (event) =>{
    if(event.key === 'ArrowDown'){
        isDownPressed = false;
    }
});

document.addEventListener('keydown', (event) =>{
    if(event.key === 'ArrowUp'){
        isUpPressed = true;
    }
});

document.addEventListener('keyup', (event) =>{
    if(event.key === 'ArrowUp'){
        isUpPressed = false;
    }
});

loop();