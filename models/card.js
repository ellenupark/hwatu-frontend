class Card {
    constructor(id, category, image, matched, playerId, month) {
        this.id = id;
        this.category = category;
        this.image = image;
        this.matched = matched; 
        this.playerId = playerId;
        this.month = month;
        this.renderCard();
    };

    renderCard() {
        const cardContainer = document.getElementsByClassName(`player-${this.playerId}`)[0];
        const cardImg = document.createElement('img')

        if (this.playerId == game.deck.id) {
            if (cardContainer.childElementCount === 0) {
                cardImg.setAttribute('src', "https://i.ibb.co/QJ2J9d2/cardback.png");
                cardContainer.appendChild(cardImg)
            }
        } else if (this.playerId == game.computer.id) {
            cardImg.dataset.month = this.month;
            cardImg.dataset.category = this.category;
            cardImg.id = `card-${this.id}`
            cardImg.setAttribute('src', 'https://i.ibb.co/QJ2J9d2/cardback.png')  
            cardContainer.appendChild(cardImg)
        } else {
            cardImg.dataset.month = this.month;
            cardImg.dataset.category = this.category;
            cardImg.id = `card-${this.id}`
            cardImg.setAttribute('src', this.image)
            cardContainer.appendChild(cardImg)
        }
    }

    createCardImgHtml() {
        let cardImg = document.createElement('img');
        cardImg.setAttribute('src', this.image);
        cardImg.style.maxWidth = "45px";
        return cardImg;
    }

    // static addPlayCardEventToUser() {
    //     let userCards = Array.from(document.getElementById('user-container').children);

    //     userCards.forEach(function(card) {
    //         card.addEventListener('click', Card.moveCardToBoard)
    //     })
    // }

    static moveCardToBoard() {
        let cardInPlay = document.createElement('img');
        cardInPlay.setAttribute('src', `${event.target.src}`)
        cardInPlay.dataset.month = event.target.dataset.month;
        cardInPlay.dataset.category = event.target.dataset.category;

        let inPlayDiv = document.getElementById('played-container');

        event.target.remove()
        inPlayDiv.appendChild(cardInPlay)

        let userCards = Array.from(document.getElementById('user-container').children);

        userCards.forEach(function(card) {
            card.removeEventListener('click', Game.playTurn)
        })
    }

    // static moveCardToBoard() {
    //     game.midTurn = true;
    //     const cardId = this.id.split('-')[1];
    //     const boardPlayer = game.players.find(x => x.role === 'board');
    //     const userPlayer = game.players.find(x => x.role === 'user');

    //     fetch(`http://localhost:3000/cards/${cardId}`, {
    //         method: "PATCH",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Accept": "application/json"
    //         },
    //         body: JSON.stringify({
    //             player_id: parseInt(boardPlayer.id)
    //         })
    //     })
    //     .then(function(resp) {
    //         Card.loadPlayerCards(boardPlayer);
    //     })
    //     .then(function(resp) {
    //         Card.loadPlayerCards(userPlayer);
    //     })
    // }

    static loadPlayerCards(player) {
        fetch(`http://localhost:3000/players/${player.id}`)
            .then(resp => resp.json())
            .then(function(resp) {
                Card.loadPlayerCardsHtml(resp)
            })
    }

    static loadPlayerCardsHtml(player) {
        let playerDiv = document.getElementsByClassName(`player-${player.data.id}`)[0];
        playerDiv.innerHTML = "";
    
        player.data.attributes.cards.forEach(function(card) {
            new Card(card.id, card.category, card.image, card.matched, card.player_id, card.month)
        });

        // if (game.midTurn == true && player.data.attributes.role == 'user') {
        //     game.playTurn();
        // } else if (player.data.attributes.role == 'board' && game.midTurn == false) {
        //     game.collectPairsFromBoard();
        // }
    }

    static dealCards() {
        fetch(`http://localhost:3000/cards`)
            .then(resp => resp.json())
            .then(function(cards) {
                Card.assignCards(cards)
            })
    }

    static assignCards(cards) {
        let player_list = {
            user: {
                count: 8,
                id: game.user.id
            },
            computer: {
                count: 8,
                id: game.computer.id
            },
            deck: {
                count: 22,
                id: game.deck.id
            },
            board: {
                count: 10,
                id: game.board.id
            }
        }

        Object.keys(player_list).forEach(function(player) {
            document.getElementById(`${player}-container`).innerHTML = "";
        })

        cards.data.forEach(function(card) {
            let assignedPlayer = sample(Object.keys(player_list))
            fetch(`http://localhost:3000/cards/${card.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    player_id: parseInt(player_list[assignedPlayer].id)
                })
            })

            player_list[assignedPlayer].count -= 1;

            if (player_list[assignedPlayer].count == 0) {
                delete player_list[assignedPlayer]
            }            
        });
        API.loadCards();
    }




};


function downcaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

// function loadPlayerCards(player) {
//     fetch(`http://localhost:3000/players/${player.id}`)
//     .then(resp => resp.json())
//     .then(function(resp) {
//         loadPlayerCardsHtml(resp)
//     })
// }

// function loadPlayerCardsHtml(player) {
//     let playerDiv = document.getElementById(`player-${player.data.id}`);
//     playerDiv.innerHTML = "";

//     player.data.attributes.cards.forEach(function(card) {
//         let newImg = document.createElement("img");
//         newImg.setAttribute('src', card.image)
//         playerDiv.appendChild(newImg)
//     });
// }