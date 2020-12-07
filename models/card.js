class Card {
    constructor(id, category, image, matched, playerId, month) {
        this.id = id;
        this.category = category;
        this.image = image;
        this.matched = matched; 
        this.playerId = playerId;
        this.month = month;
        this.renderCard();
        // this.addToCardSummary()
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

    static addPlayCardEventToUser() {
        let userCards = Array.from(document.getElementById('user-container').children);

        userCards.forEach(function(card) {
            card.addEventListener('click', Card.moveCardToBoard)
        })
    }

    static moveCardToBoard() {
        game.midTurn = true;
        const cardId = this.id.split('-')[1];
        const boardPlayer = game.players.find(x => x.role === 'board');
        const userPlayer = game.players.find(x => x.role === 'user');

        fetch(`http://localhost:3000/cards/${cardId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                player_id: parseInt(boardPlayer.id)
            })
        })
        .then(function(resp) {
            debugger
            Card.loadPlayerCards(boardPlayer);
            return resp;
        })
        .then(function(resp) {
            debugger
            Card.loadPlayerCards(userPlayer);
            return resp;
        })
    }

    static loadPlayerCards(player) {
        fetch(`http://localhost:3000/players/${player.id}`)
            .then(resp => resp.json())
            .then(function(resp) {
                Card.loadPlayerCardsHtml(resp)
            })
    }

    static loadPlayerCardsHtml(player) {
        debugger
        let playerDiv = document.getElementsByClassName(`player-${player.data.id}`)[0];
        playerDiv.innerHTML = "";
    
        player.data.attributes.cards.forEach(function(card) {
            new Card(card.id, card.category, card.image, card.matched, card.player_id, card.month)
        });

        if (game.midTurn == true && player.data.attributes.role == 'user') {
            debugger
            game.playTurn();
        } else if (player.data.attributes.role == 'user') {
            game.collectPairsFromBoard();
        }
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