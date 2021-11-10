const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const WIDTH = 600;
const HEIGHT = 400;
const charScale = 1.5;
const wChar = 16;
const hChar = 16;
const scaledCharWidth = charScale * wChar;
const scaledCharHeight = charScale * hChar;
const charLoop = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const FRAME_LIMIT = 6;
const CHAR_DOWN = 2;
const CHAR_UP = 0;
const CHAR_LEFT = 1;
const CHAR_RIGHT = 3;

let charSpeed = 6;
//let charX = 150;
//let charY = 100;
let currentLoopIndex = 0;
let charFrameCount = 0;
let charDirection = CHAR_DOWN;
let keyDown = {};
let imgChar = new Image();
let players = [];
let currentPlayer;
let chosenColor = localStorage.getItem('color');

class Player {
    constructor(name, color, posX, posY) {
        this.state = {
            name: name,
            color: color,
            charSpeedX: 6,
            charSpeedY: 6,
            charX: posX,
            charY: posY,
            charLoop: charLoop,
            currentLoopIndex: currentLoopIndex,
            charFrameCount: charFrameCount,
            charDirection: charDirection
        }
    }

    draw(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI*2);
        ctx.fillStyle = this.state.color;
        ctx.fill();
        ctx.closePath();
    }

    drawChat(msg) {
        let msgBox = document.createElement('div');
        let gameWindow = document.getElementById('canvas-wrap');
        msgBox.id = Math.random() + '-msg';
        let msgId = msgBox.id;
        msgBox.classList.add('chat-box');
        msgBox.innerText = msg;
        msgBox.style.position = 'absolute';

        let drawMsg = () => {
            msgBox.style.top = this.state.charY - (hChar * 3) + 'px';
            msgBox.style.left = this.state.charX - (wChar) + 'px';
            gameWindow.appendChild(msgBox);
        }
        
        function deleteMsg() {
            clearInterval(showMsg);
            let message = document.getElementById(msgId);
            gameWindow.removeChild(message);
        }

        let showMsg = setInterval(drawMsg, 10);

        setTimeout(deleteMsg, 3000);
    }

    charStep = () => {
        let { charSpeedX, charSpeedY, charY, charX } = this.state;

        if (document.activeElement.id != 'input') {
            
            if (keyDown[87]) {
                if (charY - charSpeed > 0 - hChar / 2) { 
                    charSpeedX = 0;
                    charY -= charSpeedY;
                }
            } else if (keyDown[83]) {
                if (charY + charSpeed < HEIGHT - scaledCharHeight) { 
                    charSpeedX = 0;
                    charY += charSpeedY;
                }
            }

            if (keyDown[65]) {
                if (charX - charSpeed > 0 - wChar / 2) {
                    charSpeedY = 0;
                    charX -= charSpeedX;
                }
            } else if (keyDown[68]) {
                if (charX + charSpeed < WIDTH - wChar) {
                    charSpeedY = 0;
                    charX += charSpeedX;
                } 
            }

            this.state.charX = charX;
            this.state.charY = charY;
        }
        socket.emit('update-player-pos', this.state);
        window.requestAnimationFrame(this.charStep);

    }
    
}

window.addEventListener('keydown', keyDownListener);
function keyDownListener(event) {
    keyDown[event.keyCode] = true;
}

window.addEventListener('keyup', keyUpListener);
function keyUpListener(event) {
    keyDown[event.keyCode] = false;
}

function init() {
    canvas.width = 600;
    canvas.height = 400;

    currentPlayer = new Player(username, chosenColor, 100, 150);
    socket.emit('new-player', currentPlayer);
}

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawPlayers() {
    clear();
    players.forEach(p => {
        p.draw(p.state.charX, p.state.charY);
    });
}

socket.on('existing-players', function(playersArr) {
    playersArr.forEach(p => {
        player = new Player(p.state.name, p.state.color, p.state.charX, p.state.charY);
        players.push(player);
        drawPlayers();
    });
});

socket.on('set-user', function(username, color) {
    currentPlayer.state.name = username;
    currentPlayer.state.color = color;
});

socket.on('create-player', function() {
    window.requestAnimationFrame(currentPlayer.charStep);
});

socket.on('create-new-player', function(p) {
    player = new Player(p.state.name, p.state.color, p.state.charX, p.state.charY);
    players.push(player);
    drawPlayers();
});

socket.on('delete-player', function(user) {
    let playerIndex = players.findIndex(p => p.state.name === user);
    players.splice(playerIndex, 1);
    drawPlayers();
});

socket.on('update-player-pos', function(playerState) {
    let playerMove = players.find(p => p.state.name === playerState.name);
    playerMove.state = playerState;
    drawPlayers();
});

socket.on('sendMsg', function(username, msg) {
    let user = players.find(p => p.state.name === username);
    user.drawChat(msg);
});


init();