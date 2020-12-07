class Game {
    constructor() {
        this.players = [];
        this.turnCount = 1;
        // this.playTurn();
        // this.user = user;
        // this.computer = computer;
    };

    add(player){
        this.players.push(player)
        return player
    }

    get computer() {
        return this.players.find(x => x.role === "computer")
    }

    get user() {
        return this.players.find(x => x.role === "user")
    }

    get board() {
        return this.players.find(x => x.role === "board")
    }

    get deck() {
        return this.players.find(x => x.role === "deck")
    }
};

const game = new Game();
