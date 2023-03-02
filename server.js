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

//Escuchar el puerto
server.listen(PORT, () => {
    console.log('Servidor ejecutando en puerto: ' + PORT);
});

//Realiza la connección
io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        console.log('Usuario desconectado - Usuario: ' + socket.username);
        Users = Users.filter((item) => item !== socket.username);
        io.emit('send server message', { message: socket.username + " se ha desconectado(a)" })
    });

    //Envia mensaje general
    socket.on('new message', (msg) => {
        io.emit('send message', { message: msg, user: socket.username });
    });
    
    //Envia mensaje en privado
    socket.on('new message private', (msg) => {
        io.emit('send message private', {message: msg.msg, user: socket.username, destiny: msg.user})
    })

    //Envia archivo privado
    socket.on('new file private', (msg) => {
        io.emit('send file private', { user: socket.username, message: msg.msg, destiny: msg.destiny, file: msg.file });
    });

    //Envia archivo general
    socket.on("new file", (msg) => {
        io.emit('send file', { user: socket.username, message: msg.msg, file: msg.file });
    });

    //Crea un usuario
    socket.on('new user', (usr) => {
        socket.username = usr;
        if (Users.includes(usr) != true) {
            console.log('Usuario conectado - Usuario: ' + socket.username);
            io.emit('send server message', { message: socket.username + " se ha conectado(a)" })
            Users.push(socket.username)
        } else {
            io.to(socket.id).emit('no register', {message: 'Usuario existente, por favor ingrese otro nombre'})
        }
    });
});

