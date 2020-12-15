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
        this.points = 0;
        this.id = 0;
    };

    reset() {
        this.turnCount = 0;
        this.name = "";
        this.points = 0;
        this.id = 0;
    };

    add(player){
        this.players.push(player);
        return player;
    };

    get computer() {
        return this.players.find(player => player.role === "computer")
    };

    get user() {
        return this.players.find(player => player.role === "user")
    };

    get board() {
        return this.players.find(player => player.role === "board")
    };

    get deck() {
        return this.players.find(player => player.role === "deck")
    };

    get currentPlayer() {
        if (this.turnCount % 2 === 0) {
            return this.computer;
        } else {
            return this.user;
        }
    };

    // --------- GAME MECHANICS ---------

    async playGame() {
        game.turnCount += 1;
        Game.displayCurrentPlayer();

        let userCards = userContainer.children;
        
        for (let i = 0; i < userCards.length; i++) {
            userCards[i].addEventListener('click', Game.playTurn)
        }
        return this.turnCount;
    };
    
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
                boardPairs[0].classList.add('highlight', 'set');
                flippedCard = await Game.flipCardFromDeck();
                break;
            case 2:
                if (game.currentPlayer.role === 'user') {
                    boardPairs.forEach(card => card.classList.add('highlight'));
                    Game.displayPickCardInstructions();
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
    };

    static async findBoardPairs() {
        const playedCard = document.getElementsByClassName('played-card')[0];
        const playedCardMonth = playedCard.dataset.month;

        let cardsOnBoard = Array.from(boardContainer.children);
        let matchedCards = cardsOnBoard.filter(card => card.dataset.month === playedCardMonth);
        
        return matchedCards;
    };

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
            <h5>Select Card to Pair With</h5>
        </div>
        `
        return notice;
    };

    static displayFlipCardFromDeckInstructions() {
        const notice = document.getElementById('instruction-display');
        notice.innerHTML += `
        <div class="flip-notice">
            <h5>Flip Card</h5>
        </div>
        `
    };

    static displayCurrentPlayer() {
        const notice = document.getElementById('current-player-display');
        if (game.currentPlayer === game.user) {
            notice.innerHTML = `
                <div id="current-player-notice">
                    <h5>Your Turn</h5>
                </div>
            `
        } else {
            notice.innerHTML = `
                <div id="current-player-notice">
                    <h5>Opponent's Turn</h5>
                </div>
            `
        };
    };
    
    static async awaitUserInput() {
        const timeout = async ms => new Promise(res => setTimeout(res, ms));

        while (next === false) await timeout(50); // pauses script
        next = false; // reset var
    };

    static async pickCardToPair() {
        let cardsOnBoard = Array.from(boardContainer.children);
        let pairs = cardsOnBoard.filter(c => c.classList.contains('highlight'));
        
        pairs.forEach(function(card) {
            card.addEventListener('click', () => {
                Game.selectCardToPairWith()
                .then(resp => next = true)
            });
        });
        return pairs;
    };

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
    };
    
    static async flipCardFromDeck() {
        const topCardOfDeck = await API.fetchRandomCardFromDeck();
        const flippedCard = await API.updateCardPlayerToBoard(topCardOfDeck.data.id);

        if (game.currentPlayer === game.user) {
            Game.displayFlipCardFromDeckInstructions();
            document.getElementById('card-deck').classList.add('highlight-deck');
            document.getElementById('card-deck').addEventListener('click', Game.userFlipCardFromDeck);
            await Game.awaitUserInput();
        } else {
            await timeout(1000);
        }
        const renderFlippedCard = new Card(flippedCard.data.id, flippedCard.data.attributes.category, flippedCard.data.attributes.image, flippedCard.data.attributes.matched, flippedCard.data.attributes.player.id, flippedCard.data.attributes.player.role, flippedCard.data.attributes.month)

        if (game.turnCount === 22) {
            deckContainer.firstElementChild.remove();
        };
        return renderFlippedCard;
    };

    static userFlipCardFromDeck() {
        document.getElementById('card-deck').removeEventListener('click', Game.userFlipCardFromDeck);
        document.getElementById('card-deck').classList.remove('highlight-deck');
        const notice = document.getElementById('instruction-display');
        notice.innerHTML = "";
        next = true;
    };

    static async checkBoardForPairedSets() {
        let cards = Game.retrieveAllCardsInPlay();
        let pairs = {};

        for (let i = 0; i < cards.length; i++) {
            pairs[cards[i].dataset.month] ||= [];
            pairs[cards[i].dataset.month].push(cards[i])
        }
       return pairs;
    };

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
            };

        });
        return pairs;
    };

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

        return API.updateCardPlayerToBoard(playedCard.id.split('-')[1])
        .then(card => {
            playedCard.remove();
            new Card(card.data.id, card.data.attributes.category, card.data.attributes.image, card.data.attributes.matched, card.data.attributes.player.id, card.data.attributes.player.role, card.data.attributes.month);
            return card;
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
        oldCard.remove()

        new Card(newCard.data.id, newCard.data.attributes.category, newCard.data.attributes.image, newCard.data.attributes.matched, newCard.data.attributes.player.id, newCard.data.attributes.player.role, newCard.data.attributes.month)
        return newCard;
    }

    static async playComputerTurn() {
        game.turnCount += 1;
        Game.displayCurrentPlayer(); 

        await timeout(1000);

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
    };

    static async playTurnWithoutCards() {
        game.turnCount += 1;
        
        if (game.turnCount === 23) {
            Game.displayWinner();
        } else {
            Game.displayCurrentPlayer();
            const flippedCard = await Game.flipCardFromDeck(); 
            const finalPairsOnBoard = await Game.checkBoardForPairedSets()

            await timeout(1000);
            
            const finalSets = await Game.findSets(finalPairsOnBoard)
            Game.playNextTurn();
        }
    };
    
    // END GAME MECHANICS
    static async calculateWinner() {
        let winner;
        let userCards = await Game.retrieveAllPairedCardsFromPlayer(game.user)
        let computerCards = await Game.retrieveAllPairedCardsFromPlayer(game.computer)

        let userPoints = {
            player: game.user,
            bright: 0,
            animal: 0,
            ribbon: 0,
            junk: 0,
            total: 0
        };

        let computerPoints = {
            player: game.computer,
            bright: 0,
            animal: 0,
            ribbon: 0,
            junk: 0,
            total: 0
        };

        userPoints.bright += Game.calculateBrightCardPoints(userCards);
        userPoints.animal += Game.calculateAnimalCardPoints(userCards);
        userPoints.ribbon += Game.calculateRibbonCardPoints(userCards);
        userPoints.junk += Game.calculateJunkCardPoints(userCards);
        userPoints.total += userPoints.bright + userPoints.animal + userPoints.ribbon + userPoints.junk;

        computerPoints.bright += Game.calculateBrightCardPoints(computerCards);
        computerPoints.animal += Game.calculateAnimalCardPoints(computerCards);
        computerPoints.ribbon += Game.calculateRibbonCardPoints(computerCards);
        computerPoints.junk += Game.calculateJunkCardPoints(computerCards);
        computerPoints.total += computerPoints.bright + computerPoints.animal + computerPoints.ribbon + computerPoints.junk;
        
        userPoints.total > computerPoints.total ? winner = userPoints : winner = computerPoints;
        return winner;
    }

    static async retrieveAllPairedCardsFromPlayer(player) {
        const playerSets = Array.from(document.getElementById(`${player.role}-pairs`).children);
        playerSets.shift();

        let pairedCards = [];

        playerSets.forEach(function(month) {
            Array.from(month.children).forEach(card => pairedCards.push(card))
        })
        return pairedCards;
    };

    static async displayWinner() {
        const winner = await Game.calculateWinner();
        game.points = winner.total;
        await API.updateGamePointTotal();

        const parentDiv = document.getElementById('winner');
        const displayName = document.getElementById('game-winner');

        // Render who won
        winner.player === game.user ? displayName.innerText = `${game.name} Won!` : displayName.innerText = 'You Lost! Better Luck Next Time!';
        
        // Render users points
        parentDiv.innerHTML += Game.renderUserPointTotal(winner);

        // Render game history
        await Game.renderGameHistory();

        // Add event listeners to buttons
        const playAgainButton = document.getElementById('play-again')
        const exitButton = document.getElementById('exit')

        // Hide game board and reveal winner display
        document.getElementById('main-game').classList.add('hidden')
        parentDiv.classList.remove('hidden')

        playAgainButton.addEventListener('click', Game.resetGame)
        exitButton.addEventListener('click', Game.exitGame)

        document.getElementById('welcome-div').classList.remove('hidden');
    };

    static renderUserPointTotal(winner) {
        return `
                <div class="row justify-content-center">
                    <div class="col-3" id="point-display">
                        <h4>${game.name}'s Total Points: ${winner.total}</h4>
                        <p>Bright Points: ${winner.bright}</p>
                        <p>Animal Points: ${winner.animal}</p>
                        <p>Ribbon Points: ${winner.ribbon}</p>
                        <p>Junk Points: ${winner.junk}</p>
                    </div>
                    <div class="col-3" id="leaderboard">
                        <h4>High Scores</h4>
                    </div>
                </div>
        `
    };

    static async renderGameHistory() {
        const parentDiv = document.getElementById('leaderboard');
        const games = await API.loadTopTenGames();

        asyncForEach(games.data, async function(game) {
            parentDiv.innerHTML += Game.renderGameHistoryHtml(game);
            return game;
        })
         
        return games;
    };

    static renderGameHistoryHtml(game) {
        return `
            <p>${game.attributes.name}: ${game.attributes.points}</p>
        `
    };

    static resetWinnerDisplay() {
        document.getElementById('winner').innerHTML = `
            <div class="row">
                <div class="col-sm-12 my-auto" id="display-winner">
                    <h3 id="game-winner"></h3>
                    <button type="submit" id="play-again" class="btn btn-primary mb-2">Play Again?</button>
                    <button type="submit" id="exit" class="btn btn-secondary mb-2">Exit</button>
                </div>
            </div>
        `        
    };

    static async exitGame() {
        game.reset();
        await Card.dealCards();

        userPairs.innerHTML = '<h3 id="player-pairs"></h3>'
        computerPairs.innerHTML = `<h3>Opponent's Sets</h3>`
        document.getElementById('point-display').remove();

        document.getElementById('main-game').classList.add('hidden')
        document.getElementById('winner').classList.add('hidden')
        document.getElementById('welcome').classList.remove('hidden')
        document.getElementById('nav-bar').classList.add('hidden');
        Game.resetWinnerDisplay();
    }

    static async resetGame() {
        let newGame = await API.createNewGame();
        game.turnCount = 0;
        game.id = newGame.data.id;
        await Card.dealCards();
        game.playGame();

        userPairs.innerHTML = `<h3 id="player-pairs">${game.name}'s Sets</h3>`
        computerPairs.innerHTML = `<h3>Opponent's Sets</h3>`;
        document.getElementById('display-winner').lastElementChild.remove();

        document.getElementById('main-game').classList.remove('hidden')
        document.getElementById('winner').classList.add('hidden')
        Game.resetWinnerDisplay();
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
            points += 1;
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
