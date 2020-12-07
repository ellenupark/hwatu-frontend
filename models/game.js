class Game {
    constructor() {
        this.players = [];
        this.turnCount = 1;
        this.started = false;
        this.deckCount = 22;
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

    currentPlayer() {
        game.turnCount % 2 === 0 ? this.computer : this.user;
    }

    playerCardDiv(roleAsString) {
        return document.getElementById(`${roleAsString}-container`)
    }

    checkBoardForPairs() {
        let currentBoard = Array.from(game.playerCardDiv('board').children);
        const cardInPlay = game.playerCardDiv('board').lastChild;
        cardInPlay.classList.add("highlight");

        let pairs = currentBoard.filter(x => x.dataset.month == cardInPlay.dataset.month && x !== cardInPlay) 
        switch (pairs.length) {
            case 1:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                    card.dataset.matched = `${this.currentPlayer.role}`
                    cardInPlay.dataset.matched = `${this.currentPlayer.role}`
                });
                this.retrieveCardFromDeck();
                break;
            case 2:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                });
                // Allow User to pick which card to pair with
                this.selectCardToPairWith(pairs);
                break;
            case 3:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                });
                break;
            case 0:
                this.retrieveCardFromDeck();
                break;
        };
    };

    selectCardToPairWith(pairs) {
        debugger
    };

    retrieveCardFromDeck() {
        fetch(`http://localhost:3000/players/${this.deck.id}`)
        .then(res => res.json())
        .then(player => {
            this.selectRandomCardAndMoveToDeck(player);
        });
    };

    selectRandomCardAndMoveToDeck(player) {
        debugger
    }

    playTurn() {
        // while (game.deckCount > 0) {
            this.checkBoardForPairs()
        // }
    }
};

const game = new Game();

// Select random element from array
function sample(array) {
    return array[Math.floor ( Math.random() * array.length )]
}