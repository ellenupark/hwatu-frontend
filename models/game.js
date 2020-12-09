const boardContainer = document.getElementById('board-container');
const deckContainer = document.getElementById('deck-container');
const userContainer = document.getElementById('user-container');
const computerContainer = document.getElementById('computer-container');
const userPairs = document.getElementById('user-pairs');
const computerPairs = document.getElementById('computer-pairs');

const playedCardDiv = document.getElementById('played-container');


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
        const notice = document.getElementById('instruction-display');
        notice.innerHTML = "";

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
        fetch(`http://localhost:3000/players/${game.deck.id}`)
        .then(resp => resp.json())
        .then(deck => {
            Game.selectRandomCardFromDeck(deck);
        });
    };

    static selectRandomCardFromDeck(deck) {
        if (deck.data.attributes.cards === 0) {
            return;
        }

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
            Game.checkBoardForPairedSets();
            return;
        }, 1000);
    }

    static checkBoardForPairedSets() {
        let cards = Game.retrieveAllCardsInPlay();
        let playedCard = playedCardDiv.firstElementChild;

        // Iterate through cards O(n)
        for (let i = 0; i < cards.length; i++) {

            // Select card month
            let month = cards[i].dataset.month;
            
            // Filter cards array by month
            let cardsFilteredByMonth = cards.filter(c => c.dataset.month === month);

            // If filter cards array length is 1 AND includes card in play
            if (cardsFilteredByMonth.length === 1 && cardsFilteredByMonth.includes(playedCard)) {

                // Move card in play to board and Update cards player to board
                Game.movePlayedCardToBoard()

            // else if filter cards array length is 2
            } else if (cardsFilteredByMonth.length === 2) {

                // Move to current player pairs
                Game.collectPairsFromBoard();

            // else if filter card array length is 3 AND array includes card in play
            }

                    // Move card in play to board

                    // Update card player to board

                // else if filter card array length is 4 

                    // Move card to current player pairs

        }

    }

    static retrieveAllCardsInPlay() {
        let cards = [];
        let playedCard = playedCardDiv.children[0];
        let boardCards = boardContainer.children;

        cards.push(playedCard);
        for (let i = 0; i < boardCards.length; i++) {
            cards.push(boardCards[i])
        };
        return cards;
    };

    // When played card does not make any pairs
    static movePlayedCardToBoard() {
        let playedCard = playedCardDiv.firstElementChild;

        fetch(`http://localhost:3000/cards/${playedCard.id.split('-')[1]}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                player_id: game.board.id
            })
        })
        .then(resp => resp.json())
        .then(function(card) {
            setTimeout(function () {
                playedCard.remove();
                new Card(card.data.id, card.data.attributes.category, card.data.attributes.image, card.data.attributes.matched, card.data.attributes.player.id, card.data.attributes.player.role, card.data.attributes.month)
                return;
            }, 1000);
        })
    };

    static collectPairsFromBoard() {
        console.log('Collect pairs from board and assign to player.')
    }
};

const game = new Game();

// Select random element from array
function sample(array) {
    return array[Math.floor ( Math.random() * array.length )]
}