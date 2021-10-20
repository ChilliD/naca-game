const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
let users = {};

app.use(express.static("public"));

io.on('connection', (client) => {
    client.on('join', (name) => {
        users[client.id] = name;
        client.nickname = name;
        client.emit('update', "You have connected to the server.");
        client.broadcast.emit('update', users[client.id] + ' has joined the server.');
        io.sockets.emit('update-users', Object.values(users));
    });

    client.on('sendMsg', (msg) => {
        io.emit('sendMsg', users[client.id], msg);
    });

    client.on('disconnect', () => {
        io.sockets.emit('update', users[client.id] + ' has left the server.')
        delete users[client.id];
        io.sockets.emit('update-users', Object.values(users));
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
})