var socket = io();
let form = document.getElementById('form');
let input = document.getElementById('input');
let messages = document.getElementById('messages');
let username = localStorage.getItem('user');
let color = localStorage.getItem('color');

function resetList(parent) {
    while (parent.lastChild) {
        parent.removeChild(parent.firstChild);
    }
};
window.onload = function() {
    socket.emit('join', username, color);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('sendMsg', input.value);
        input.value = '';
    }
});

socket.on('update-users', function(users) {
    let header = document.getElementById('active-users');
    let frame = document.getElementById('users-list');
    header.innerHTML = `${users.length} users online`;
    resetList(frame);
    users.forEach(user => {
        let item = document.createElement('li');
        item.textContent = user;
        frame.appendChild(item);
    });
});

socket.on('update',  function(color, msg) {
    let update = document.createElement('li');
    let chatWindow = document.getElementById('messages');
    update.textContent = msg;
    update.style.color = color;
    messages.appendChild(update);
    chatWindow.scrollTo(0, chatWindow.scrollHeight);
});

socket.on('sendMsg', function(user, msg) {
    let item = document.createElement('li');
    let chatWindow = document.getElementById('messages');
    item.textContent = user + ': ' + msg;
    messages.appendChild(item);
    chatWindow.scrollTo(0, chatWindow.scrollHeight);
});