const boardContainer = document.getElementById('board-container');
const deckContainer = document.getElementById('deck-container');
const userContainer = document.getElementById('user-container');
const computerContainer = document.getElementById('computer-container');
const userPairs = document.getElementById('user-pairs');
const computerPairs = document.getElementById('computer-pairs');

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
                Game.flipCardFromDeck();
                break;
            case 1:
                pairs[0].classList.add('highlight')
                pairs[0].classList.add('set')
                Game.flipCardFromDeck();
                break;
            case 2:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                });
                // Allow User to pick which card to pair with
                Game.displayPickCardInstructions();
                Game.pickCardToPair();
                break;
            case 3:
                pairs.forEach(function(card) {
                    card.classList.add('highlight');
                    card.classList.add('set');
                });
                Game.flipCardFromDeck();
                break;
        };

    }

    static displayPickCardInstructions() {
        const notice = document.getElementById('instruction-display');
        notice.innerHTML += `
        <div class="rule-notice">
            <p>Select Card to Pair With!</p>
        </div>
        `
    }

    static pickCardToPair() {
        let cardsOnBoard = Array.from(document.getElementById('board-container').children);
        let pairs = cardsOnBoard.filter(c => c.classList.contains('highlight'));
        
        pairs.forEach(function(card) {
            card.addEventListener('click', Game.selectCardToPairWith)
        })
    }

    static selectCardToPairWith() {
        let cardsOnBoard = Array.from(document.getElementById('board-container').children);
        let pairs = cardsOnBoard.filter(c => c.classList.contains('highlight'));

        pairs.forEach(function(card) {
            if (card !== event.target) {
                card.classList.remove('highlight');
            }
        })

        Game.flipCardFromDeck();
        event.target.classList.add('set')
        event.target.removeEventListener('click', Game.selectCardToPairWith)
    }

    static flipCardFromDeck() {
        debugger
        fetch(`http://localhost:3000/players/${game.deck.id}`)
        .then(resp => resp.json())
        .then(deck => {
            Game.selectRandomCardFromDeck(deck);
        });
    };

    static selectRandomCardFromDeck(deck) {
        let randomCard = sample(deck.data.attributes.cards);

        fetch(`http://localhost:3000/cards/${randomCard.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    player_id: game.board.id
                })
            })

        let randomCardHtml = Card.renderCardHtml(randomCard);
        
        setTimeout(function () {
            boardContainer.appendChild(randomCardHtml);
            return;
        }, 1000);
    }
};

const game = new Game();

// Select random element from array
function sample(array) {
    return array[Math.floor ( Math.random() * array.length )]
}