const boardContainer = document.getElementById('board-container');
const deckContainer = document.getElementById('deck-container');
const userContainer = document.getElementById('user-container');
const computerContainer = document.getElementById('computer-container');
const userPairs = document.getElementById('user-pairs');
const computerPairs = document.getElementById('computer-pairs');
let next = false;

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

    // --------- GAME MECHANICS ---------

    async playGame() {
        
        this.turnCount += 1;
        let userCards = userContainer.children;

        if (userContainer.childElementCount === 0) {
            Game.playUserTurnWithoutCards();
        } else {
            for (let i = 0; i < userCards.length; i++) {
                userCards[i].addEventListener('click', Game.playTurn)
            }
        }

        return this.turnCount;
    }

    static async playTurnWithoutCards() {
        
        game.turnCount += 1;

        if (game.turnCount === 23) {
            Game.displayWinner();
        } else {
            let flippedCard = await Game.flipCardFromDeck();
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
    
    // EDITED

    static async playTurn() {
        if (game.currentPlayer.role === 'user') {
            const playedCard = await Game.moveCardToBoard();
        }

        // Highlight card that matches played card month
        const boardPairs = await Game.findBoardPairs()
        

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
        

        if (game.currentPlayer.role === 'user' && computerContainer.childElementCount !== 0) {
            Game.playComputerTurn()
        } else if (game.currentPlayer.role === 'user' && computerContainer.childElementCount === 0) {
            Game.playTurnWithoutCards();
        } else if (game.currentPlayer.role === 'computer' && userContainer.childElementCount !== 0) {
            game.playGame()
        } else {
            Game.playTurnWithoutCards();
        }
    };

    static async findBoardPairs() {
        
        const playedCard = playedCardDiv.firstElementChild;
        const playedCardMonth = playedCard.dataset.month;

        let cardsOnBoard = Array.from(boardContainer.children);
        let matchedCards = cardsOnBoard.filter(card => card.dataset.month === playedCardMonth);
        
        return matchedCards
    }

    // END EDITED

    // UNTOUCHED
    // static async playTurn() {
    //     const playedCard = await Game.moveCardToBoard();
    //     
    //     Game.highlightMatchingCardMonths();
    // };



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
    

    // EDITED
    static highlightMatchingCardMonths() {
        const playedCard = playedCardDiv.firstElementChild;
        const playedCardMonth = playedCard.dataset.month;

        let cardsOnBoard = Array.from(boardContainer.children);
        let matchedCards = cardsOnBoard.filter(card => card.dataset.month === playedCardMonth);
        
        return matchedCards;
    }
    
    // UNTOUCHED
    // static highlightMatchingCardMonths() {
    //     const playedCard = playedCardDiv.firstElementChild;
    //     const playedCardMonth = playedCard.dataset.month;

    //     let cardsOnBoard = Array.from(boardContainer.children);
    //     let matchedCards = cardsOnBoard.filter(card => card.dataset.month === playedCardMonth);
        
    //     switch (matchedCards.length) {
    //         case 0:
    //             Game.flipCardFromDeck();
    //             break;
    //         case 1:
    //             matchedCards[0].classList.add('highlight', 'set')
    //             Game.flipCardFromDeck();
    //             break;
    //         case 2:
    //             if (game.currentPlayer.role === 'user') {
    //                 matchedCards.forEach(card => card.classList.add('highlight'));
    //                 Game.displayPickCardInstructions();
    //                 Game.pickCardToPair();
    //                 break;
    //             } else {
    //                 let matchedCard = sample(matchedCards);
    //                 matchedCard.classList.add('highlight', 'set');
    //                 Game.flipCardFromDeck();
    //                 break;
    //             }
    //         case 3:
    //             matchedCards.forEach(card => card.classList.add('highlight', 'set'));
    //             Game.flipCardFromDeck();
    //             break;
    //     };
    // }


    // EDITED

    
    static async flipCardFromDeck() {
        if (game.turnCount === 22) {
            deckContainer.firstElementChild.remove();
        }

        const topCardOfDeck = await API.fetchRandomCardFromDeck();
        const flippedCard = await API.updateCardPlayerToBoard(topCardOfDeck);

        await timeout(1000);
        const renderFlippedCard = new Card(flippedCard.data.id, flippedCard.data.attributes.category, flippedCard.data.attributes.image, flippedCard.data.attributes.matched, flippedCard.data.attributes.player.id, flippedCard.data.attributes.player.role, flippedCard.data.attributes.month)

        return renderFlippedCard;
    };


    // EDITED END


    // UNTOUCHED
    // static flipCardFromDeck() {
    //     if (game.turnCount === 22) {
    //         return;
    //     }
    //     fetch(`http://localhost:3000/players/${game.deck.id}/cards`)
    //     .then(resp => resp.json())
    //     .then(card => API.updateCardPlayerToBoard(card))
    //     .then(function(card) {
    //         let promise = new Promise(function(resolve, reject) {
    //             setTimeout(() => resolve(new Card(card.data.id, card.data.attributes.category, card.data.attributes.image, card.data.attributes.matched, card.data.attributes.player.id, card.data.attributes.player.role, card.data.attributes.month)), 1000);
    //         });
    //         return promise;
    //     })
    //     .then(function(card) {
    //         Game.checkBoardForPairedSets()
    //         setTimeout(function() {
    //             if (game.currentPlayer.role === 'user') {
    //                 Game.playComputerTurn()
    //             } else {
    //                 game.playGame();
    //             }
    //         }, 3000)
    //     })
    // };


    // EDITED

    static async checkBoardForPairedSets() {
        // let playedCard = playedCardDiv.firstElementChild;
        let cards = Game.retrieveAllCardsInPlay();

        let pairs = {}

        for (let i = 0; i < cards.length; i++) {
            pairs[cards[i].dataset.month] ||= [];
            pairs[cards[i].dataset.month].push(cards[i])
        }

        
       return pairs;
    }





    // EDITED END




    // UNEDITED
    // static checkBoardForPairedSets() {
    //     let playedCard = playedCardDiv.firstElementChild;
    //     let cards = Game.retrieveAllCardsInPlay();

    //     let pairs = {}

    //     for (let i = 0; i < cards.length; i++) {
    //         pairs[cards[i].dataset.month] ||= [];
    //         pairs[cards[i].dataset.month].push(cards[i])
    //     }

    //     Game.findSets(pairs)
    // }




    // EDITED
    static async findSets(pairs) {
        let playedCard = playedCardDiv.firstElementChild;
        let flippedCard = boardContainer.lastElementChild;
        const months = Object.keys(pairs);

        await asyncForEach(months, async (month) => {

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




    // END EDITED




    // UNEDITED
    // static findSets(pairs) {
    //     let playedCard = playedCardDiv.firstElementChild;
    //     let result = Object.keys(pairs).map(async function (month) {
    //         if (pairs[month].length === 1 && pairs[month].includes(playedCard)) {
    //             return await Game.movePlayedCardToBoard();
    //         } else if (pairs[month].length === 2) {
    //             if (pairs[month].includes(playedCard) || pairs[month].includes(boardContainer.lastElementChild)) {
    //                 pairs[month].forEach(c => c.classList.remove('highlight'));
    //                 Game.collectPairsFromBoard(pairs[month]);
    //             }
    //         } else if (pairs[month].length === 3 && pairs[month].includes(playedCard)) {
    //             if (boardContainer.lastElementChild.dataset.month == playedCard.dataset.month) {
    //                 pairs[month].forEach(c => c.classList.remove('highlight'));
    //                 Game.movePlayedCardToBoard();
    //             } else {
    //                 let chosenPair = pairs[month].filter(c => c.classList.contains('set') || c == playedCard);
    //                 chosenPair.forEach(c => c.classList.remove('highlight'));
    //                 Game.collectPairsFromBoard(chosenPair);
    //             }
    //         } else if (pairs[month].length === 4) {
    //             if (pairs[month].includes(playedCard) || pairs[month].includes(boardContainer.lastElementChild)) {
    //                 pairs[month].forEach(c => c.classList.remove('highlight'));
    //                 Game.collectPairsFromBoard(pairs[month]);
    //             }
    //         }
    //     })
    //     return result;
    // }


    // static checkBoardForPairedSets() {
    //     let cards = Game.retrieveAllCardsInPlay();
    //     let pairs = {}

    //     for (let i = 0; i < cards.length; i++) {
    //         pairs[cards[i].dataset.month] ||= [];
    //         pairs[cards[i].dataset.month].push(cards[i])
    //     }
    //     return Game.findSets(pairs)
    // }

    // static findSets(pairs) {
    //     let playedCard = playedCardDiv.firstElementChild;
    //     let result =  Object.keys(pairs).map(function (month) {
    //         if (pairs[month].length === 1 && pairs[month].includes(playedCard)) {
    //             Game.movePlayedCardToBoard();
    //         } else if (pairs[month].length === 2) {
    //             if (pairs[month].includes(playedCard) || pairs[month].includes(boardContainer.lastElementChild)) {
    //                 pairs[month].forEach(c => c.classList.remove('highlight'));
    //                 Game.collectPairsFromBoard(pairs[month]);
    //             }
    //         } else if (pairs[month].length === 3 && pairs[month].includes(playedCard)) {
    //             if (boardContainer.lastElementChild.dataset.month == playedCard.dataset.month) {
    //                 pairs[month].forEach(c => c.classList.remove('highlight'));
    //                 Game.movePlayedCardToBoard();
    //             } else {
    //                 let chosenPair = pairs[month].filter(c => c.classList.contains('set') || c == playedCard);
    //                 chosenPair.forEach(c => c.classList.remove('highlight'));
    //                 Game.collectPairsFromBoard(chosenPair);
    //             }
    //         } else if (pairs[month].length === 4) {
    //             if (pairs[month].includes(playedCard) || pairs[month].includes(boardContainer.lastElementChild)) {
    //                 pairs[month].forEach(c => c.classList.remove('highlight'));
    //                 Game.collectPairsFromBoard(pairs[month]);
    //             }
    //         }
    //     })

    //     return result;
    // }

    static retrieveAllCardsInPlay() {
        let cards = [];
        let playedCard = playedCardDiv.children[0];
        let boardCards = boardContainer.children;

        if (playedCardDiv.children[0] !== undefined) {
            cards.push(playedCard);
            for (let i = 0; i < boardCards.length; i++) {
                cards.push(boardCards[i])
            };
            return cards;
        } else {
            return boardCards;
        }
         
    };

    // When played card does not make any pairs
    static async movePlayedCardToBoard() {
        let playedCard = playedCardDiv.firstElementChild;

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
        let updatedCards = []

        await asyncForEach(cards, async (card) => {
            let updatedCard = await Game.updateCardDetails(card);
            updatedCards.push(updatedCard);
        })
        
        return updatedCards;
    }

    static async updateCardDetails(card) {
        return fetch(`http://localhost:3000/cards/${card.id.split('-')[1]}`, {
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
        .then(updatedCard => Game.displayCardInPairsDiv(card, updatedCard))
    }

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
        let myCards = Array.from(computerContainer.children);
        let cards = Array.from(boardContainer.children);

        if (myCards.length === 0) {
            return;
        }

        let pairs = {}

        for (let i = 0; i < pairs.length; i++) {
            pairs[cards[i].dataset.month] ||= [];
            pairs[cards[i].dataset.month].push(cards[i])
        }

        return pairs;
    }

    static async pickComputerCardToPlay(pairs) {
        const myCards = Array.from(computerContainer.children);
        const months = Object.keys(pairs);

        let cardToPlay = await Game.findCardToPlay(myCards, months, pairs);
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
        playedCard.id = card.id;

        await timeout(1000);
        card.remove();
        playedCardDiv.appendChild(playedCard)
        
        return playedCard;
    }

    // static playComputerCard(card) {
    //     let playedCard = document.createElement('img');

    //     playedCard.setAttribute('src', `${card.dataset.url}`)
    //     playedCard.dataset.month = card.dataset.month;
    //     playedCard.dataset.category = card.dataset.category;
    //     playedCard.id = card.id;

    //     let inPlayDiv = document.getElementById('played-container');

    //     setTimeout(function () {
    //         card.remove();
    //         inPlayDiv.appendChild(playedCard)
    //         Game.highlightMatchingCardMonths();
    //         return;
    //     }, 1000);
    // }

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

        document.getElementById('main-game').classList.add('hidden')
        winnerDiv.classList.remove('hidden')
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

const game = new Game();

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