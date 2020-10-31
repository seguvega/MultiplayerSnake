const express = require('express');
const socketIO = require('socket.io');
const { initGame, gameLoop, getUpdateVelocity } = require('./game') //Importo el objeto game state 
const { frameRate } = require('./constants')
const { makeid } = require("./utils")
const index = 'index.html';
const PORT = process.env.PORT || 3000; // puerto para Heroku
const state = {};
const clientRooms = {};

const server = express()
    .use((req, res) => {
        res.sendFile(index, { root: './frontend/' })
    })
    .listen(PORT, () => {
        console.log("Server running on port ", PORT);
    });

const io = socketIO(server);

io.on('connection', client => {
    /*client.emit('init', { data: "Hellow world" });*/

    ///Escuchando al frondend
    client.on('keydown', handleKeyDown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(gameCode) {
        const room = io.sockets.adapter.rooms[gameCode];
        let allUsers;

        if (room) {
            allUsers = room.sockets;
        }
        let numClient = 0;

        if (allUsers) {
            numClient = Object.keys(allUsers).length;
        }

        if (numClient == 0) {
            client.emit("unknownGame");
            return;
        } else if (numClient > 1) {
            client.emit("tooManyPlayers");
            return;
        }

        clientRooms[client.id] = gameCode;
        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(gameCode);
    }

    function handleNewGame() {
        let roomName = makeid(6);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeyDown(keyCode) {
        const roomName = clientRooms[client.id];
        console.log("Clientes y sus Salas", clientRooms); //objeto
        if (!roomName) {
            console.log("1");
            return;
        }

        try {
            keyCode = parseInt(keyCode)

        } catch (e) {
            console.log(e);
            return;
        }

        const vel = getUpdateVelocity(keyCode);
        if (vel) {
            state[roomName].players[client.number - 1].vel = vel; //cambia la propiedad vel del objeto player[0] o [1] dependiendo del cliente 
        }
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName])
        console.log('State', state); //Objeto state
        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            //Elimine envez de poner null al objeto de nombre rommName que contiene todo el initGame
            //state[roomName] = null;
            delete state.roomName;
            //Se eliminar del objeto clientRooms{id_cliente: sala} para que no entren al Handlekeydown
            var jugadores = Object.keys(clientRooms);
            jugadores.forEach(jugador => {
                if (clientRooms[jugador] == roomName) {
                    delete clientRooms[jugador];
                }
            });
            emitGameOver(roomName, winner);

            clearInterval(intervalId);
        }
    }, 1000 / frameRate);
}

function emitGameState(roomName, state) {
    io.sockets.in(roomName).emit('gameState', JSON.stringify(state))
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName)
        .emit('gameOver', JSON.stringify({ winner }));
}


//https://stackoverflow.com/questions/34498819/socket-io-works-with-localhost-but-not-on-heroku-server
//https://devcenter.heroku.com/articles/node-websockets#option-2-socket-io