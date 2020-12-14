class Card {
    constructor(id, category, image, matched, playerId, playerRole, month) {
        this.id = id;
        this.category = category;
        this.image = image;
        this.matched = matched; 
        this.playerId = playerId;
        this.playerRole = playerRole;
        this.month = month;
        game[playerRole].add(this);
        this.matched === true ? this.renderCardMatchedSets() : this.renderCard();
    };

    renderCard() {
        const cardContainer = document.getElementById(`${this.playerRole}-container`);
        const cardImg = document.createElement('img')

        switch (this.playerRole) {
            case 'deck':
                if (cardContainer.childElementCount === 0) {
                    cardImg.id = `card-deck`;
                    cardImg.setAttribute('src', "https://i.ibb.co/QJ2J9d2/cardback.png");
                } else {
                    return;
                }
                break; 
            case 'computer':
                cardImg.dataset.month = this.month;
                cardImg.dataset.category = this.category;
                cardImg.dataset.url = this.image;
                cardImg.id = `card-${this.id}`
                cardImg.setAttribute('src', 'https://i.ibb.co/QJ2J9d2/cardback.png')
                break;
            default:
                cardImg.dataset.month = this.month;
                cardImg.dataset.category = this.category;
                cardImg.id = `card-${this.id}`
                cardImg.setAttribute('src', this.image);
                break;
        }
        cardContainer.appendChild(cardImg);
    }

    renderCardMatchedSets() {
        const cardContainer = document.getElementById(`${this.playerRole}-pairs`);

        if (cardContainer.getElementsByClassName(`${this.month}-matched`).length > 0) {
            let newCard = document.createElement('img')
            newCard.dataset.month = this.month;
            newCard.dataset.category = this.category;
            newCard.id = `card-${this.id}`
            newCard.setAttribute('src', this.image);
            
            cardContainer.getElementsByClassName(`${this.month}-matched`)[0].appendChild(newCard);
        } else {
            let newSet = document.createElement('div')
            newSet.classList.add(`${this.month}-matched`)
            newSet.classList.add('matched');

            let monthTitle = document.createElement('p');
            monthTitle.innerText = `${this.month}`;
            monthTitle.classList.add('month-title');
            newSet.prepend(monthTitle);

            cardContainer.appendChild(newSet);

            let newCard = document.createElement('img')
            newCard.dataset.month = this.month;
            newCard.dataset.category = this.category;
            newCard.id = `card-${this.id}`
            newCard.setAttribute('src', this.image);

            newSet.appendChild(newCard);
        }
    }

    createCardImgHtml() {
        let cardImg = document.createElement('img');
        cardImg.setAttribute('src', this.image);
        cardImg.style.maxWidth = "45px";
        return cardImg;
    }

    static createCardSummaryHtml(card) {
        let cardHtml = document.createElement('img');
        cardHtml.setAttribute('src', card.attributes.image);
        cardHtml.style.maxWidth = "45px";
        return cardHtml;
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

    static checkPlayerForFullHand(player) {
        let full = false;

        switch (player.role) {
            case 'user':
                player.cards.length === 7 ? full = true : full = false;
                break;
            case 'computer':
                player.cards.length === 7 ? full = true : full = false;
                break;
            case 'deck':
                player.cards.length === 21 ? full = true : full = false;
                break;
            case 'board':
                player.cards.length === 9 ? full = true : full = false;
                break;
        };
        return full;
    };

    static async dealCards() {
        await Card.clearAllCardsFromBoard();
        let cards = await API.retrieveAllCards();
        let playerPool = [game.user, game.board, game.computer, game.deck];

        await asyncForEach(cards.data, async (card) => {
            let assignedPlayer = sample(playerPool);

            // Prevents 4 of same card month from being dealt to user/board/computer
            if (assignedPlayer.cards.filter(c => c.month === card.attributes.month).length === 3 && assignedPlayer !== game.deck) {
                debugger
                assignedPlayer = sample(playerPool.filter(p => p !== assignedPlayer));
            };
            
            let updatedCard = await API.updateCardPlayer(card, assignedPlayer);

            // Check if assigned player hand is full
            if (Card.checkPlayerForFullHand(assignedPlayer)) {
                playerPool.splice(playerPool.indexOf(assignedPlayer), 1);
            };
            
            return new Card(updatedCard.data.id, updatedCard.data.attributes.category, updatedCard.data.attributes.image, updatedCard.data.attributes.matched, updatedCard.data.attributes.player.id, updatedCard.data.attributes.player.role, updatedCard.data.attributes.month);
        })
        return cards;
    };

    static async loadCardsToSummary() {

        const cards = await API.retrieveAllCards();
        asyncForEach(cards.data, async function(card) {
            const cardMonth = downcaseFirstLetter(card.attributes.month);
            const parentMonthDiv = document.getElementById(cardMonth);
            const cardMonthImg = Card.createCardSummaryHtml(card)
            parentMonthDiv.appendChild(cardMonthImg)
    
            const cardCategory = card.attributes.category;
            const parentCategoryDiv =  document.getElementsByClassName(cardCategory)[0];
            const cardCategoryImg = Card.createCardSummaryHtml(card)
            parentCategoryDiv.appendChild(cardCategoryImg)
            return card;
        });
        return cards;
    };

    static renderCardHtmlFromDatabase(card) {
        let newCard = document.createElement('img');
        newCard.dataset.month = card.data.attributes.month;        ;
        newCard.dataset.category = card.data.attributes.category;
        newCard.id = `card-${card.data.id}`
        newCard.setAttribute('src', card.data.attributes.image);
        return newCard;
    }

    static renderCardHtml(card) {
        let newCard = document.createElement('img');
        newCard.dataset.month = card.dataset.month;
        newCard.dataset.category = card.dataset.category;
        newCard.id = card.id;
        newCard.classList.add('played-card')
        newCard.setAttribute('src', card.src);
        return newCard;
    }

    static async clearAllCardsFromBoard() {
        game.players.forEach(player => player.cards = []);
        await asyncForEach(game.players, async (player) => {
            document.getElementById(`${player.role}-container`).innerHTML = ""
            return player;
        })
        return game.players;
    }
};