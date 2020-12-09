class Card {
    constructor(id, category, image, matched, playerId, playerRole, month) {
        this.id = id;
        this.category = category;
        this.image = image;
        this.matched = matched; 
        this.playerId = playerId;
        this.playerRole = playerRole;
        this.month = month;
        this.renderCard();
    };

    renderCard() {
        const cardContainer = document.getElementById(`${this.playerRole}-container`);
        const cardImg = document.createElement('img')

        switch (this.playerRole) {
            case 'deck':
                if (cardContainer.childElementCount === 0) {
                    cardImg.setAttribute('src', "https://i.ibb.co/QJ2J9d2/cardback.png");
                } else {
                    return;
                }
                break; 
            case 'computer':
                cardImg.dataset.month = this.month;
                cardImg.dataset.category = this.category;
                cardImg.id = `card-${this.id}`
                cardImg.classList.add(`${this.playerRole}-test`)
                cardImg.setAttribute('src', 'https://i.ibb.co/QJ2J9d2/cardback.png')
                break;
            default:
                cardImg.dataset.month = this.month;
                cardImg.dataset.category = this.category;
                cardImg.id = `card-${this.id}`
                cardImg.classList.add(`${this.playerRole}-test`)
                cardImg.setAttribute('src', this.image);
                break;
        }
        cardContainer.appendChild(cardImg);
    }

    createCardImgHtml() {
        let cardImg = document.createElement('img');
        cardImg.setAttribute('src', this.image);
        cardImg.style.maxWidth = "45px";
        return cardImg;
    }

    // Move played card to board and remove event listener from User cards
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
    }

    static async dealCards() {
        return fetch(`http://localhost:3000/cards`)
            .then(resp => resp.json())
            .then(async function(resp) {
                let cards = await Card.assignCards(resp)
                return cards;
            })
    }

    static async assignCards() {
        let cards = await API.retrieveAllCards()

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
                    player_id: player_list[assignedPlayer].id
                })
            })

            player_list[assignedPlayer].count -= 1;

            if (player_list[assignedPlayer].count == 0) {
                delete player_list[assignedPlayer]
            }            
        });

        cards = await API.retrieveAllCards()
        return cards;
    }

    static renderCardHtml(card) {
        let newCard = document.createElement('img');
        newCard.dataset.month = card.month;
        newCard.dataset.category = card.category;
        newCard.id = `card-${card.id}`
        newCard.setAttribute('src', card.image);
        return newCard;
    }
};


function downcaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}