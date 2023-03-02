const { connect } = require('http2');
const express = require('express')
const application = require('express')();
const server = require('http').createServer(application)
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000

var Users = [];

application.use(express.static(__dirname + '/assets/'))

application.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


server.listen(PORT, () => {
    console.log('Servidor ejecutando en puerto: ' + PORT);
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        console.log('Usuario desconectado - Usuario: ' + socket.username);
        Users = Users.filter((item) => item !== socket.username);
        io.emit('send server message', { message: socket.username + " se ha ido" })
    });

    socket.on('new message', (msg) => {
        io.emit('send message', { message: msg, user: socket.username });
    });

    socket.on('new message private', (msg) => {
        io.emit('send message private', {message: msg.msg, user: socket.username, destiny: msg.user})
    })

    socket.on('new file private', (msg) => {
        io.emit('send file private', { user: socket.username, message: msg.msg, destiny: msg.destiny, file: msg.file });
    });

    socket.on("new file", (msg) => {
        io.emit('send file', { user: socket.username, message: msg.msg, file: msg.file });
    });

    socket.on('new user', (usr) => {
        socket.username = usr;
        if (Users.includes(usr) != true) {
            console.log('Usuario conectado - Usuario: ' + socket.username);
            io.emit('send server message', { message: socket.username + " se ha unido" })
            Users.push(socket.username)
        } else {
            io.to(socket.id).emit('no register', {message: 'Usuario tomado, ingrese otro por favor'})
        }
    });
});

