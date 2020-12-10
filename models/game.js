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
        this.turnCount = 0;
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
        this.turnCount += 1;
        let userCards = userContainer.children;

        if (userCards.length === 0) {
            Game.flipCardFromDeck();
        } else {
            for (let i = 0; i < userCards.length; i++) {
                userCards[i].addEventListener('click', Game.playTurn)
            }
        }
    }

    static playTurn() {
        Game.moveCardToBoard();
        Game.highlightBoardPairs();
    };

    static moveCardToBoard() {
        debugger
        let playedCard = event.target;
        let userCards = userContainer.children;

        let playedCardHtml = Card.renderCardHtml(playedCard);
        let inPlayDiv = document.getElementById('played-container');
        playedCard.remove();
        playedCardDiv.appendChild(playedCardHtml);

        for (let i = 0; i < userCards.length; i++) {
            userCards[i].removeEventListener('click', Game.playTurn)
        }
    }

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
                if (game.currentPlayer.role == 'user') {
                    pairs.forEach(function(card) {
                        card.classList.add('highlight');
                    });
                    // Allow User to pick which card to pair with
                    Game.displayPickCardInstructions();
                    Game.pickCardToPair();
                    break;
                } else {
                    pairs.forEach(function(card) {
                        if (card.dataset.category !== 'junk') {
                            card.classList.add('highlight');
                            card.classList.add('set')
                            Game.flipCardFromDeck();
                        } else if (card.dataset.category == 'junk' && card == pairs[pairs.length - 1]) {
                            card.classList.add('highlight');
                            card.classList.add('set')
                            Game.flipCardFromDeck();
                        }
                    });
                    break;
                }
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

        let randomCardHtml = Card.renderCardHtmlFromDatabase(randomCard);

        setTimeout(function () {
            boardContainer.appendChild(randomCardHtml);
            Game.checkBoardForPairedSets();
            setTimeout(function () {
                if (game.currentPlayer.role === 'user') {
                    
                    Game.playComputerTurn()
                } else {
                    
                    game.playGame()
                }
            }, 3000);
            return;
        }, 1000);
    }

    static checkBoardForPairedSets() {
        let cards = Game.retrieveAllCardsInPlay();
        let playedCard = playedCardDiv.firstElementChild;

        let pairs = {}

        // Iterate through cards O(n)
        for (let i = 0; i < cards.length; i++) {
            pairs[cards[i].dataset.month] ||= [];
            pairs[cards[i].dataset.month].push(cards[i])
        }

        Object.keys(pairs).forEach(function(month) {
            if (pairs[month].length === 1 && pairs[month].includes(playedCard)) {
                
                Game.movePlayedCardToBoard();
            } else if (pairs[month].length === 2) {
                if (pairs[month].includes(playedCard) || pairs[month].includes(boardContainer.lastElementChild)) {
                    
                    pairs[month].forEach(c => c.classList.remove('highlight'))
                    Game.collectPairsFromBoard(pairs[month])
                }
            } else if (pairs[month].length === 3 && pairs[month].includes(playedCard)) {
                if (boardContainer.lastElementChild.dataset.month == playedCard.dataset.month) {
                    
                    pairs[month].forEach(c => c.classList.remove('highlight'))
                    Game.movePlayedCardToBoard();
                } else {
                    let chosenPair = pairs[month].filter(c => c.classList.contains('set') || c == playedCard)
                    chosenPair.forEach(c => c.classList.remove('highlight'))
                    Game.collectPairsFromBoard(chosenPair)
                }
            } else if (pairs[month].length === 4) {
                if (pairs[month].includes(playedCard) || pairs[month].includes(boardContainer.lastElementChild)) {
                    pairs[month].forEach(c => c.classList.remove('highlight'))
                    Game.collectPairsFromBoard(pairs[month])
                }
            }
        })

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

    static collectPairsFromBoard(cards) {
        cards.forEach(card => Game.updateCardDetails(card));
        return cards;
    }

    static updateCardDetails(card) {
        
        fetch(`http://localhost:3000/cards/${card.id.split('-')[1]}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                player_id: game.currentPlayer.id,
                matched: true
            })
        })
        .then(resp => resp.json())
        .then(function(updatedCard) {
            setTimeout(function () {
                card.remove();
                new Card(updatedCard.data.id, updatedCard.data.attributes.category, updatedCard.data.attributes.image, updatedCard.data.attributes.matched, updatedCard.data.attributes.player.id, updatedCard.data.attributes.player.role, updatedCard.data.attributes.month)
                return;
            }, 1000);
        })
    }

    static playComputerTurn() {
        game.turnCount += 1;

        if (boardContainer.childElementCount === 0 && deckContainer.childElementCount === 0 && userContainer.childElementCount === 0 && computerContainer.childElementCount === 0) {
            Game.calculateWinner()
        }
        Game.moveComputerCardToBoard();
    }

    static moveComputerCardToBoard() {
        let myCards = Array.from(computerContainer.children);
        let cards = Array.from(boardContainer.children);

        if (myCards.length === 0) {
            return;
        }

        let pairs = {}

        for (let i = 0; i < cards.length; i++) {
            pairs[cards[i].dataset.month] ||= [];
            pairs[cards[i].dataset.month].push(cards[i])
        }

        for (let i = 0; i < myCards.length; i ++) {
            if (Object.keys(pairs).includes(myCards[i].dataset.month) && pairs[myCards[i].dataset.month].length === 3) {
                // Play Card
                
                Game.playComputerCard(myCards[i]);
                break;
            } else if (Object.keys(pairs).includes(myCards[i].dataset.month) && pairs[myCards[i].dataset.month].length === 2) {
                
                Game.playComputerCard(myCards[i]);
                break;
            } else if (myCards[i] == myCards[myCards.length - 1] && playedCardDiv.childElementCount === 0) {
                // Play Random Card
                
                Game.playComputerCard(myCards[i])
                break;
            }
        }
    }

    static playComputerCard(card) {
        let playedCard = document.createElement('img');

        playedCard.setAttribute('src', `${card.dataset.url}`)
        playedCard.dataset.month = card.dataset.month;
        playedCard.dataset.category = card.dataset.category;
        playedCard.id = card.id;

        let inPlayDiv = document.getElementById('played-container');

        setTimeout(function () {
            card.remove();
            inPlayDiv.appendChild(playedCard)
            Game.highlightBoardPairs();
            return;
        }, 1000);
    }

    static calculateWinner() {
        debugger
    }
};

const game = new Game();

// Select random element from array
function sample(array) {
    return array[Math.floor ( Math.random() * array.length )]
}