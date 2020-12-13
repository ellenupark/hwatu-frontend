const boardContainer = document.getElementById('board-container');
const deckContainer = document.getElementById('deck-container');
const userContainer = document.getElementById('user-container');
const computerContainer = document.getElementById('computer-container');
const userPairs = document.getElementById('user-pairs');
const computerPairs = document.getElementById('computer-pairs');
const playedCardDiv = document.getElementById('played-container');
let next = false;

class Game {
    constructor() {
        this.players = [];
        this.turnCount = 0;
        this.name = "";
    };

    reset() {
        this.turnCount = 0;
        this.name = "";
    }

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

    // --------- GAME MECHANICS ---------

    async playGame() {
        
        game.turnCount += 1;
        let userCards = userContainer.children;
        
        for (let i = 0; i < userCards.length; i++) {
            userCards[i].addEventListener('click', Game.playTurn)
        }
        return this.turnCount;
    };

    static async playTurnWithoutCards() {
        
        game.turnCount += 1;
        
        if (game.turnCount === 23) {
            Game.displayWinner();
        } else {
            const flippedCard = await Game.flipCardFromDeck(); 
            const finalPairsOnBoard = await Game.checkBoardForPairedSets()

            await timeout(1000);
            
            const finalSets = await Game.findSets(finalPairsOnBoard)

            if (game.currentPlayer.role === 'user' && computerContainer.childElementCount !== 0) {
                Game.playComputerTurn()
            } else if (game.currentPlayer.role === 'user' && computerContainer.childElementCount === 0) {
                Game.playTurnWithoutCards();
            } else if (game.currentPlayer.role === 'computer' && userContainer.childElementCount !== 0) {
                game.playGame()
            } else {
                Game.playTurnWithoutCards();
            }
        }
    }
    
    static async playTurn() {
        if (game.currentPlayer.role === 'user') {
            const playedCard = await Game.moveCardToBoard();
        }
        const boardPairs = await Game.findBoardPairs();

        let flippedCard;
        switch (boardPairs.length) {
            case 0:
                flippedCard = await Game.flipCardFromDeck();
                break;
            case 1:
                boardPairs[0].classList.add('highlight', 'set')
                flippedCard = await Game.flipCardFromDeck();
                break;
            case 2:
                if (game.currentPlayer.role === 'user') {
                    boardPairs.forEach(card => card.classList.add('highlight'));
                    let instructions = await Game.displayPickCardInstructions();
                    let finalPickedCard = await Game.pickCardToPair();
                    
                    let canContinue = await Game.awaitUserInput()
                    
                    flippedCard = await Game.flipCardFromDeck();
                    
                    break;
                } else {
                    let matchingCardMonth = sample(boardPairs);
                    matchingCardMonth.classList.add('highlight', 'set');
                    flippedCard = await Game.flipCardFromDeck();
                    break;
                }
            case 3:
                boardPairs.forEach(card => card.classList.add('highlight', 'set'));
                flippedCard = await Game.flipCardFromDeck();
                break;
        };

        
        const finalPairsOnBoard = await Game.checkBoardForPairedSets()
        await timeout(1000);
        
        const finalSets = await Game.findSets(finalPairsOnBoard)
        
        Game.playNextTurn();
    };

    static playNextTurn() {
        if (game.currentPlayer.role === 'user' && computerContainer.childElementCount !== 0) {
            Game.playComputerTurn();
        } else if (game.currentPlayer.role === 'user' && computerContainer.childElementCount === 0) {
            Game.playTurnWithoutCards();
        } else if (game.currentPlayer.role === 'computer' && userContainer.childElementCount !== 0) {
            game.playGame();
        } else {
            Game.playTurnWithoutCards();
        }
    }

    static async findBoardPairs() {
        const playedCard = document.getElementsByClassName('played-card')[0];
        const playedCardMonth = playedCard.dataset.month;

        let cardsOnBoard = Array.from(boardContainer.children);
        let matchedCards = cardsOnBoard.filter(card => card.dataset.month === playedCardMonth);
        
        return matchedCards
    }

    // --------- USER ---------

    static async moveCardToBoard() {
        let playedCard = event.target;
        let playedCardHtml = Card.renderCardHtml(playedCard);
        
        playedCard.remove();
        playedCardDiv.appendChild(playedCardHtml);

        let userCards = userContainer.children;
        for (let i = 0; i < userCards.length; i++) {
            userCards[i].removeEventListener('click', Game.playTurn)
        }

        return playedCardHtml;
    }

    static async displayPickCardInstructions() {
        const notice = document.getElementById('instruction-display');
        notice.innerHTML += `
        <div class="rule-notice">
            <p>Select Card to Pair With!</p>
        </div>
        `
        return notice
    }

    
    static async awaitUserInput() {
        const timeout = async ms => new Promise(res => setTimeout(res, ms));

        while (next === false) await timeout(50); // pauses script
        next = false; // reset var
    }

    static async pickCardToPair() {
        let cardsOnBoard = Array.from(boardContainer.children);
        let pairs = cardsOnBoard.filter(c => c.classList.contains('highlight'));
        
        pairs.forEach(function(card) {
            card.addEventListener('click', () => {
                Game.selectCardToPairWith()
                .then(resp => next = true)
            })
        })

        return pairs;
    }

    static async selectCardToPairWith() {
        const selectedCard = event.target
        const notice = document.getElementById('instruction-display');
        notice.innerHTML = "";

        let cardsOnBoard = Array.from(document.getElementById('board-container').children);
        let pairs = cardsOnBoard.filter(c => c.classList.contains('highlight'));

        pairs.forEach(function(card) {
            if (card !== selectedCard) {
                card.classList.remove('highlight');
            }
        })

        selectedCard.classList.add('set')
        selectedCard.removeEventListener('click', Game.selectCardToPairWith)

        
        return selectedCard;
    }

    // GAME MECHANICS
    
    static async flipCardFromDeck() {
        const topCardOfDeck = await API.fetchRandomCardFromDeck();
        const flippedCard = await API.updateCardPlayerToBoard(topCardOfDeck);
        await timeout(1000);
        const renderFlippedCard = new Card(flippedCard.data.id, flippedCard.data.attributes.category, flippedCard.data.attributes.image, flippedCard.data.attributes.matched, flippedCard.data.attributes.player.id, flippedCard.data.attributes.player.role, flippedCard.data.attributes.month)

        if (game.turnCount === 22) {
            deckContainer.firstElementChild.remove();
        };
        return renderFlippedCard;
    };

    static async checkBoardForPairedSets() {
        let cards = Game.retrieveAllCardsInPlay();
        let pairs = {};

        for (let i = 0; i < cards.length; i++) {
            pairs[cards[i].dataset.month] ||= [];
            pairs[cards[i].dataset.month].push(cards[i])
        }
       return pairs;
    }

    static async findSets(pairs) {
        let playedCard = playedCardDiv.firstElementChild
        let flippedCard = boardContainer.lastElementChild;
        const months = Object.keys(pairs);

        await asyncForEach(months, async (month) => {
            // If played card does not match any other cards on board
            if (pairs[month].length === 1 && pairs[month].includes(playedCard)) {
            
                let playedCardMovedToBoard = await Game.movePlayedCardToBoard();
            } else if (pairs[month].length === 2) {
                if (pairs[month].includes(playedCard) || pairs[month].includes(flippedCard)) {   
                    pairs[month].forEach(c => c.classList.remove('highlight'));
                    let collectedCards = await Game.collectPairsFromBoard(pairs[month]);
                }
            } else if (pairs[month].length === 3 && pairs[month].includes(playedCard)) {
                if (flippedCard.dataset.month == playedCard.dataset.month) {
                    pairs[month].forEach(c => c.classList.remove('highlight', 'set'));
                    let playedCardMovedToBoard = await Game.movePlayedCardToBoard();
                } else {
                    let chosenPair = pairs[month].filter(c => c.classList.contains('set') || c == playedCard);
                    chosenPair.forEach(c => c.classList.remove('highlight', 'set'));
                    
                    let collectedCards = await Game.collectPairsFromBoard(chosenPair);
                }
            } else if (pairs[month].length === 4) {
                if (pairs[month].includes(playedCard) || pairs[month].includes(flippedCard)) {
                    pairs[month].forEach(c => c.classList.remove('highlight'));
                    let collectedCards = await Game.collectPairsFromBoard(pairs[month]);
                }
            }

        })
        return pairs;
    }

    static retrieveAllCardsInPlay() {
        let cards = [];
        let playedCard = document.getElementsByClassName('played-card')[0];
        let boardCards = boardContainer.children;

        if (playedCard) {
            cards.push(playedCard);
            for (let i = 0; i < boardCards.length; i++) {
                cards.push(boardCards[i])
            };
            return cards;
        } else {
            return boardCards;
        };
    };

    // When played card does not make any pairs
    static async movePlayedCardToBoard() {
        let playedCard = playedCardDiv.firstElementChild

        return fetch(`http://localhost:3000/cards/${playedCard.id.split('-')[1]}`, {
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
            playedCard.remove();
            new Card(card.data.id, card.data.attributes.category, card.data.attributes.image, card.data.attributes.matched, card.data.attributes.player.id, card.data.attributes.player.role, card.data.attributes.month)
            return card
        })
    };

    static async collectPairsFromBoard(cards) {
        let updatedCards = [];

        await asyncForEach(cards, async (card) => {
            let updatedCard = await Game.updateCardDetails(card);
            updatedCards.push(updatedCard);
        })
        
        return updatedCards;
    }

    static async updateCardDetails(card) {
        let updatedCard = await fetch(`http://localhost:3000/cards/${card.id.split('-')[1]}`, {
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
        await Game.displayCardInPairsDiv(card, updatedCard);
        return updatedCard;
    };

    static async displayCardInPairsDiv(oldCard, newCard) {
        // await timeout(1000);
        oldCard.remove()

        new Card(newCard.data.id, newCard.data.attributes.category, newCard.data.attributes.image, newCard.data.attributes.matched, newCard.data.attributes.player.id, newCard.data.attributes.player.role, newCard.data.attributes.month)
        return newCard;
    }

    static async playComputerTurn() {
        
        await timeout(1000);
        
        game.turnCount += 1;

        const possibleBoardPairs = await Game.findPossibleComputerPairs();
        const playedCard = await Game.pickComputerCardToPlay(possibleBoardPairs);
        Game.playTurn();
    }

    static async findPossibleComputerPairs() {
        const allCards = [...Array.from(computerContainer.children), ...Array.from(boardContainer.children)];

        let pairs = {}

        for (let i = 0; i < allCards.length; i++) {
            pairs[allCards[i].dataset.month] ||= [];
            pairs[allCards[i].dataset.month].push(allCards[i])
        }
        return pairs;
    }

    static async pickComputerCardToPlay(pairs) {
        const computerCards = Array.from(computerContainer.children);
        const months = Object.keys(pairs);

        let cardToPlay = await Game.findCardToPlay(computerCards, months, pairs);
        let playedCard = await Game.playComputerCard(cardToPlay);

        return playedCard;
    }

    static async findCardToPlay (cards, months, pairs) {
        let cardToPlay;

        await asyncForEach(cards, async (card) => {
            if (months.includes(card.dataset.month) && pairs[card.dataset.month].length === 3) {
                cardToPlay = cardToPlay || card;
            } else if (months.includes(card.dataset.month) && pairs[card.dataset.month].length === 2) {
                
                cardToPlay = cardToPlay || card;
            } else if (card == cards[cards.length - 1] && playedCardDiv.childElementCount === 0) {
                
                cardToPlay = cardToPlay || card;
            }
        });
        return cardToPlay;
    }

    static async playComputerCard(card) {
        
        let playedCard = document.createElement('img');

        playedCard.setAttribute('src', `${card.dataset.url}`)
        playedCard.dataset.month = card.dataset.month;
        playedCard.dataset.category = card.dataset.category;
        playedCard.classList.add('played-card');
        playedCard.id = card.id;

        await timeout(1000);
        card.remove();
        playedCardDiv.appendChild(playedCard)
        
        return playedCard;
    }

    static async calculateWinner() {
        let userCards = await Game.retrieveAllPairedCardsFromPlayer(game.user)
        let computerCards = await Game.retrieveAllPairedCardsFromPlayer(game.computer)

        let userPoints = 0;
        let computerPoints = 0;

        userPoints += Game.calculateBrightCardPoints(userCards)
        userPoints += Game.calculateAnimalCardPoints(userCards)
        userPoints += Game.calculateRibbonCardPoints(userCards)
        userPoints += Game.calculateJunkCardPoints(userCards)

        computerPoints += Game.calculateBrightCardPoints(computerCards)
        computerPoints += Game.calculateAnimalCardPoints(computerCards)
        computerPoints += Game.calculateRibbonCardPoints(computerCards)
        computerPoints += Game.calculateJunkCardPoints(computerCards)

        userPoints > computerPoints ? game.user : game.computer;
    }

    static async displayWinner() {
        const winner = await Game.calculateWinner();

        const winnerDiv = document.getElementById('winner');
        const displayName = document.getElementById('game-winner')

        winner === game.user ? displayName.innerText = `${game.name} Won!` : displayName.innerText = 'You Lost! Better Luck Next Time!'

        const playAgainButton = document.getElementById('play-again')
        const exitButton = document.getElementById('exit')

        document.getElementById('main-game').classList.add('hidden')
        winnerDiv.classList.remove('hidden')

        playAgainButton.addEventListener('click', Game.resetGame)
        exitButton.addEventListener('click', Game.exitGame)

        document.getElementById('welcome-div').classList.remove('hidden');
    }

    static async exitGame() {
        game.turnCount = 0;
        game.name = "";
        await Card.dealCards();

        document.getElementById('user-pairs').innerHTML = '<h3 id="player-pairs"></h3>'
        document.getElementById('computer-pairs').innerHTML = '<h3>Computer Pairs</h3>'

        document.getElementById('main-game').classList.add('hidden')
        document.getElementById('winner').classList.add('hidden')
        document.getElementById('welcome').classList.remove('hidden')
        document.getElementById('nav-bar').classList.add('hidden');
    }

    static async resetGame() {
        game.turnCount = 0;
        await Card.dealCards();
        game.playGame();

        document.getElementById('user-pairs').innerHTML = `<h3 id="player-pairs">${game.name}'s Pairs</h3>`
        document.getElementById('computer-pairs').innerHTML = '<h3>Computer Pairs</h3>'

        document.getElementById('main-game').classList.remove('hidden')
        document.getElementById('winner').classList.add('hidden')
    }

    static async retrieveAllPairedCardsFromPlayer(player) {
        const playerSets = Array.from(document.getElementById(`${player.role}-pairs`).children);
        playerSets.shift();

        let playerCards = [];

        playerSets.forEach(function(month) {
            Array.from(month.children).forEach(card => playerCards.push(card))
        })

        return playerCards;
    }

    static calculateBrightCardPoints(cards) {
        let points = 0;
        let brightCards = cards.filter(card => card.dataset.category === "bright")

        switch (brightCards.length) {
            case 5:
                points += 15;
                break;
            case 4:
                points += 4;
                break;
            case 3:
                brightCards.some(card => card.dataset.month === 'December') ? points += 2 : points += 3;
                break;
        }
        return points;
    }

    static calculateAnimalCardPoints(cards) {
        let points = 0;
        let animalCards = cards.filter(card => card.dataset.category === "animal")

        if (animalCards.length > 5) {
            points += 5;
            let additionalPoints = animalCards.length - 5;
            points += additionalPoints;
        } else if (animalCards.length === 5) {
            points += 1;
        }

        if (animalCards.some(card => card.dataset.month === "February") && animalCards.some(card => card.dataset.month === "April") && animalCards.some(card => card.dataset.month === "August")) {
            points += 5;
        }

        return points;
    }

    static calculateRibbonCardPoints(cards) {
        let points = 0;
        let ribbonCards = cards.filter(card => card.dataset.category === "ribbon")

        if (ribbonCards.length > 5) {
            points += 5;
            let additionalPoints = ribbonCards.length - 5;
            points += additionalPoints;
        } else if (ribbonCards.length === 5) {
            points += 1;
        }

        if (ribbonCards.some(card => card.dataset.month === "January") && ribbonCards.some(card => card.dataset.month === "February") && ribbonCards.some(card => card.dataset.month === "March")) {
            points += 3;
        }

        if (ribbonCards.some(card => card.dataset.month === "June") && ribbonCards.some(card => card.dataset.month === "September") && ribbonCards.some(card => card.dataset.month === "October")) {
            points += 3;
        }

        if (ribbonCards.some(card => card.dataset.month === "April") && ribbonCards.some(card => card.dataset.month === "May") && ribbonCards.some(card => card.dataset.month === "June")) {
            points += 3;
        }
        return points;
    }

    static calculateJunkCardPoints(cards) {
        let points = 0;
        let junkCards = cards.filter(card => card.dataset.category === "junk")

        if (junkCards.length > 10) {
            points += 1;
            let additionalPoints = junkCards.length - 10;
            points += additionalPoints;
        } else if (junkCards.length === 10) {
            points += 1;
        }
        return points;
    }


};

let game = new Game();

function sample(array) {
    return array[Math.floor ( Math.random() * array.length )]
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}