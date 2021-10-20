let login = document.getElementById('login');
let username = document.getElementById('username');

login.addEventListener('submit', function(e) {
    e.preventDefault();
    let name = username.value;
    if (name != '') {
        localStorage.setItem('user', name);
        window.location = "app.html";
    }
});
