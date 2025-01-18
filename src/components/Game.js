class Game {
    constructor() {
        this.players = [];
        this.isGameActive = false;
    }

    startGame() {
        this.isGameActive = true;
        console.log("Game has started!");
        // Additional logic to initialize the game
    }

    endGame() {
        this.isGameActive = false;
        console.log("Game has ended!");
        // Additional logic to finalize the game
    }

    addPlayer(player) {
        this.players.push(player);
        console.log(`${player.name} has joined the game.`);
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
        console.log(`${player.name} has left the game.`);
    }

    playerAction(action) {
        if (this.isGameActive) {
            console.log(`Player action: ${action}`);
            // Logic to handle player actions
        } else {
            console.log("Game is not active. No actions can be performed.");
        }
    }
}

export default Game;