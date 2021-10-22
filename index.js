const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const PORT = 3000 || process.env.PORT;
let users = {};
const green =  '#4cd137';
const red = '#e84118';
const yellow = '#fbc531';
let players = [];

app.use(express.static("public"));

io.on('connection', (client) => {
    client.on('join', (name, color) => {
        users[client.id] = name;
        client.nickname = name;
        client.emit('update', yellow, "You have connected to the server.");
        client.emit('existing-players', players);
        client.emit('set-user', users[client.id], color);
        client.broadcast.emit('update', green, users[client.id] + ' has joined the server.');
        io.sockets.emit('update-users', Object.values(users));
    });

    client.on('new-player', function(player) {
        players.push(player);
        client.emit('create-player', player);
        client.broadcast.emit('create-new-player', player);
    });

    client.on('update-player-pos', function(playerData) {
        let playerMoved = players.find(p => p.state.name === playerData.name);
        playerMoved.state = playerData;
        io.sockets.emit('update-player-pos', playerData);
    });

    client.on('sendMsg', (msg) => {
        io.emit('sendMsg', users[client.id], msg);
    });

    client.on('disconnect', () => {
        io.sockets.emit('update', red, users[client.id] + ' has left the server.');
        io.sockets.emit('delete-player', client.nickname);
        let playerIndex = players.findIndex(p => p.state.name === client.nickname);
        players.splice(playerIndex, 1);
        delete users[client.id];
        io.sockets.emit('update-users', Object.values(users));
    });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));