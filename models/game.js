class Game {
    constructor() {
        this.players = [];
        this.turnCount = 1;
        this.started = false;
        this.midTurn = false;
        this.deckCount = 22;
        this.name = "";
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

    get currentPlayer() {
        if (this.turnCount % 2 === 0) {
            return this.computer;
        } else {
            return this.user;
        }
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
                    card.dataset.matched = `${game.currentPlayer.role}`
                    cardInPlay.dataset.matched = `${game.currentPlayer.role}`
                });

                setTimeout(this.retrieveCardFromDeck(), 3000)
                break;
            case 2:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                });
                // Allow User to pick which card to pair with
                setTimeout(this.retrieveCardFromDeck(), 3000)
                break;
            case 3:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                });
                setTimeout(this.retrieveCardFromDeck(), 3000)
                break;
            case 0:
                setTimeout(this.retrieveCardFromDeck(), 3000)
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
        this.midTurn = false;
        let topCard = sample(player.data.attributes.cards);
        fetch(`http://localhost:3000/cards/${topCard.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                player_id: parseInt(game.board.id)
            })
        })
        .then(resp => Card.loadPlayerCards(game.board))
    }

    collectPairsFromBoard() {
        console.log('Collect pairs from board and assign to player.')
    }

    // Add Event Listener to User Cards (begin turn)
    playGame() {
        let userCards = Array.from(document.getElementById('user-container').children);

        userCards.forEach(function(card) {
            card.addEventListener('click', Game.playTurn)
        })
    }

    static playTurn() {
        Card.moveCardToBoard();
        Game.highlightBoardPairs();
    };

    static highlightBoardPairs() {
        let pairsArray = [];

        let playedCard = document.getElementById('played-container').children[0];
        let playedCardMonth = playedCard.dataset.month;

        let cardsOnBoard = Array.from(document.getElementById('board-container').children);

        let pairs = cardsOnBoard.filter(c => c.dataset.month == playedCardMonth) 
        
        switch (pairs.length) {
            case 0:
                break;
            case 1:
                pairs[0].classList.add('highlight')
                break;
            case 2:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                });
                // Allow User to pick which card to pair with
                Game.displayPickCardInstructions() 
                
                break;
            case 3:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                });
                break;
        };

    }
};

const game = new Game();

// Select random element from array
function sample(array) {
    return array[Math.floor ( Math.random() * array.length )]
}