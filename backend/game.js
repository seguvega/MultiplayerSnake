const { gridSize } = require("./constants");

module.exports = {
    initGame,
    gameLoop,
    getUpdateVelocity
}

function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x: 3,
                y: 10
            },
            vel: {
                x: 1,
                y: 0,
            },
            snake: [
                { x: 3, y: 10 }
            ]
        }, {
            pos: {
                x: 10,
                y: 10
            },
            vel: {
                x: 1,
                y: 0,
            },
            snake: [
                { x: 10, y: 10 }
            ]
        }],
        food: {
            /*Objeto vacio, ....luego se llena*/
        },
        gridsize: gridSize,
        /*El tamaño de nuestro cuadrado*/
    };
}
/// Todo el juego en el servidor no multiplica la posicion por el tamaño manipula numeros pequeños y asi consigue mas velocidad
function gameLoop(state) {
    if (!state) {
        return
    }

    var playerOne = state.players[0];
    var playerTwo = state.players[1];

    playerOne.pos.x += playerOne.vel.x
    playerOne.pos.y += playerOne.vel.y

    playerTwo.pos.x += playerTwo.vel.x
    playerTwo.pos.y += playerTwo.vel.y
        //console.log("Posicion p1 ->", playerOne.pos);

    /* if (playerOne.pos.x < 0 || playerOne.pos.x > gridSize || playerOne.pos.y < 0 || playerOne.pos.y > gridSize) {
         return 2;
     }

     if (playerTwo.pos.x < 0 || playerTwo.pos.x > gridSize || playerTwo.pos.y < 0 || playerTwo.pos.y > gridSize) {
         return 1;
     }*/

    if (state.food.x == playerOne.pos.x && state.food.y == playerOne.pos.y) {
        playerOne.snake.push({...playerOne.pos });
        console.log("Push del snake", playerOne.pos);
        playerOne.pos.x += playerOne.vel.x
        playerOne.pos.y += playerOne.vel.y
        randomFood(state);
    }

    if (state.food.x == playerTwo.pos.x && state.food.y == playerTwo.pos.y) {
        playerTwo.snake.push({...playerTwo.pos });
        playerTwo.pos.x += playerTwo.vel.x
        playerTwo.pos.y += playerTwo.vel.y
        randomFood(state);
    }


    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerTwo.snake) {
            if (cell.x == playerOne.pos.x && cell.y == playerOne.pos.y) {
                return 2;
            }
        }
        playerOne.snake.push({...playerOne.pos });
        playerOne.snake.shift();
        //console.log("serpiente p1 ->", playerOne.snake);
    }

    if (playerTwo.vel.x || playerTwo.vel.y) {
        for (let cell of playerOne.snake) {
            if (cell.x == playerTwo.pos.x && cell.y == playerTwo.pos.y) {
                return 1;
            }
        }
        playerTwo.snake.push({...playerTwo.pos });
        playerTwo.snake.shift();
    }
    /*
    console.log("Jugador 1->", playerOne.pos);
    console.log("Jugador 2->", playerTwo.pos);*/
    return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    }
    for (let cell of state.players[0].snake) {
        if (cell.x == food.x && cell.y == food.y) {
            return randomFood(state)
        }
    }

    for (let cell of state.players[1].snake) {
        if (cell.x == food.x && cell.y == food.y) {
            return randomFood(state)
        }
    }
    state.food = food
}

function getUpdateVelocity(keyCode) {
    switch (keyCode) {
        case 65:
            { //left
                return {
                    x: -1,
                    y: 0
                };
            }
        case 83:
            { //down
                return {
                    x: 0,
                    y: 1
                };
            }
        case 68:
            { //rigth
                return {
                    x: 1,
                    y: 0
                };
            }
        case 87:
            { //up
                return {
                    x: 0,
                    y: -1
                };
            }
    }

}