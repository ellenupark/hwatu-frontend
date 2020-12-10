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

    playGame() {
        this.turnCount += 1;
        let userCards = userContainer.children;

        if (userCards.length === 0) {
            Game.flipCardFromDeck();
        } else {
            for (let i = 0; i < userCards.length; i++) {
                userCards[i].addEventListener('click', () => {
                    Game.playTurn()
                    .then()
                })
            }
        }
    }
    
    // EDITED

    static async playTurn() {
        const playedCard = await Game.moveCardToBoard();
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
                    let boardPairs = sample(boardPairs);
                    boardPairs.classList.add('highlight', 'set');
                    flippedCard = await Game.flipCardFromDeck();
                    break;
                }
            case 3:
                boardPairs.forEach(card => card.classList.add('highlight', 'set'));
                flippedCard = await Game.flipCardFromDeck();
                break;
        };

        
        const finalPairsOnBoard = await Game.checkBoardForPairedSets()
        
        const finalSets = await Game.findSets(finalPairsOnBoard)
        

        if (game.currentPlayer.role === 'user') {
            
            Game.playComputerTurn()
        } else {
            
            game.playGame();
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
                .then(function(resp) {
                    
                    return resp;
                })
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
            return;
        }

        const topCardOfDeck = await API.fetchRandomCardFromDeck();
        
        const flippedCard = await API.updateCardPlayerToBoard(topCardOfDeck);

        

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
        let playedCard = playedCardDiv.firstElementChild;
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
        const months = Object.keys(pairs);

        

        await asyncForEach(months, async (month) => {
            if (pairs[month].length === 1 && pairs[month].includes(playedCard)) {
                
                let playedCardMovedToBoard = await Game.movePlayedCardToBoard();
            } else if (pairs[month].length === 2) {
                if (pairs[month].includes(playedCard) || pairs[month].includes(boardContainer.lastElementChild)) {
                    pairs[month].forEach(c => c.classList.remove('highlight'));
                    
                    let collectedCards = await Game.collectPairsFromBoard(pairs[month]);
                }
            } else if (pairs[month].length === 3 && pairs[month].includes(playedCard)) {
                if (boardContainer.lastElementChild.dataset.month == playedCard.dataset.month) {
                    pairs[month].forEach(c => c.classList.remove('highlight'));
                    let playedCardMovedToBoard = await Game.movePlayedCardToBoard();
                } else {
                    let chosenPair = pairs[month].filter(c => c.classList.contains('set') || c == playedCard);
                    chosenPair.forEach(c => c.classList.remove('highlight'));
                    
                    let collectedCards = await Game.collectPairsFromBoard(chosenPair);
                }
            } else if (pairs[month].length === 4) {
                if (pairs[month].includes(playedCard) || pairs[month].includes(boardContainer.lastElementChild)) {
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

        cards.push(playedCard);
        for (let i = 0; i < boardCards.length; i++) {
            cards.push(boardCards[i])
        };
        return cards;
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
                Game.playComputerCard(myCards[i]);
                break;
            } else if (Object.keys(pairs).includes(myCards[i].dataset.month) && pairs[myCards[i].dataset.month].length === 2) {
                Game.playComputerCard(myCards[i]);
                break;
            } else if (myCards[i] == myCards[myCards.length - 1] && playedCardDiv.childElementCount === 0) {
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
            Game.highlightMatchingCardMonths();
            return;
        }, 1000);
    }

    static calculateWinner() {
        
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