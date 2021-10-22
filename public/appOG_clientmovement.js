const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const WIDTH = 600;
const HEIGHT = 400;
const charScale = 1.5;
const wChar = 64;
const hChar = 64;
const scaledCharWidth = charScale * wChar;
const scaledCharHeight = charScale * hChar;
const charLoop = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const FRAME_LIMIT = 6;
const CHAR_DOWN = 2;
const CHAR_UP = 0;
const CHAR_LEFT = 1;
const CHAR_RIGHT = 3;

//let socket = io();
let charSpeed = 3;
let charX = 150;
let charY = 100;
let currentLoopIndex = 0;
let charFrameCount = 0;
let charDirection = CHAR_DOWN;
let keyPresses = {};
let imgChar = new Image();

/*let players = [];
let currentPlayer;

class Player {
    constructor(id, name, posX, posY, img) {
        this.id = id;
        this.name = name;
        this.posX = posX;
        this.posY = posY;
        this.img = img;
    }
}*/

window.addEventListener('keydown', keyDownListener, true);
function keyDownListener(event) {
    keyPresses[event.key] = true;
}

window.addEventListener('keyup', keyUpListener, true);
function keyUpListener(event) {
    keyPresses[event.key] = false;
}

function loadImg() {
    imgChar.src = '/assets/BODY_male.png';
    imgChar.onload = function() {
        window.requestAnimationFrame(charStep);
    };
}

function drawFrame(frameX, frameY, canvasX, canvasY) {
    ctx.drawImage(imgChar,
        frameX * wChar, frameY * hChar, wChar, hChar,
        canvasX, canvasY, scaledCharWidth, scaledCharHeight);
}

function drawChar(img, x, y) {

}

function charStep() {
    clear();

    let hasMoved = false;

    if (document.activeElement.id != 'input') {
        if (keyPresses.w) {
            if (charY - charSpeed > 0 - hChar / 2) { 
                charY -= charSpeed;
                charDirection = CHAR_UP;
                hasMoved = true;
            }
        } else if (keyPresses.s) {
            if (charY + charSpeed < HEIGHT - scaledCharHeight) { 
                charY += charSpeed;
                charDirection = CHAR_DOWN;
                hasMoved = true;
            }
        }

        if (keyPresses.a) {
            if (charX - charSpeed > 0 - wChar / 2) {
                charX -= charSpeed;
                charDirection = CHAR_LEFT;
                hasMoved = true;
            }
        } else if (keyPresses.d) {
            if (charX + charSpeed < WIDTH - wChar) {
                charX += charSpeed;
                charDirection = CHAR_RIGHT;
                hasMoved = true;
            }
        }

        if (hasMoved) {
            charFrameCount++;
            if (charFrameCount >= FRAME_LIMIT) {
                charFrameCount = 0;
                currentLoopIndex++;
                if (currentLoopIndex >= charLoop.length) {
                    currentLoopIndex = 1;
                }
            }
        } else {
            currentLoopIndex = 0;
        }
}

    drawFrame(charLoop[currentLoopIndex], charDirection, charX, charY);
    window.requestAnimationFrame(charStep);
}

function init() {
    canvas.width = 600;
    canvas.height = 400;
    loadImg();

    socket.emit('new-player', {
        x: charX,
        y: charY,
        speed: charSpeed,
        img: imgChar,
        loopIndex: currentLoopIndex,
        loop: [...charLoop],
        direction: charDirection,
        stepFunc: charStep()

    })
}

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

init();

socket.on('create-player', function(posData) {
    drawChar(posData.img, posData.x, posData.y);
});