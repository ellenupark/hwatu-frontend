class API {

    static loadCards() {
        Card.assignCards();
    };

    static async loadPlayers() {
        let playersData = await fetch("http://localhost:3000/players").then(resp => resp.json());
        return API.createPlayers(playersData);
    };


    static createPlayers(players) {
        return players.data.map(player => new Player(player.id, player.attributes.role));
    };

    static async retrieveAllCards() {
        const resp = await fetch("http://localhost:3000/cards");
        return await resp.json();
    }

    static async createCardSummary() {
        return fetch("http://localhost:3000/cards")
            .then(resp => resp.json())
            .then(cards => {
               cards.data.forEach(card => {
                API.loadCardsToSummary(card);
               })
               return cards;
            }) 
    };

    static loadCardsToSummary(card) {
        const cardMonth = downcaseFirstLetter(card.attributes.month);
        const parentMonthDiv = document.getElementById(cardMonth);
        const cardMonthImg = createCardSummaryHtml(card)
        parentMonthDiv.appendChild(cardMonthImg)
    
        const cardCategory = card.attributes.category;
        const parentCategoryDiv =  document.getElementsByClassName(cardCategory)[0];
        const cardCategoryImg = createCardSummaryHtml(card)
        parentCategoryDiv.appendChild(cardCategoryImg)
    }

    static createCardSummaryHtml(card) {
        let cardHtml = document.createElement('img');
        cardHtml.setAttribute('src', card.attributes.image);
        cardHtml.style.maxWidth = "45px";
        return cardHtml;
    }

    static async loadUserName() {
        return fetch("http://localhost:3000/games")
            .then(resp => resp.json())
            .then(cards => {
               cards.data.forEach(card => {
                API.loadCardsToSummary(card);
               })
            }) 
    }

    static reloadPlayersAndCards() {
        fetch("http://localhost:3000/players")
            .then(resp => resp.json())
            .then(players => {
                players.data.forEach(player => {
                    new Player(player.id, player.attributes.role)
                })
                players.data.forEach(player => {
                    player.attributes.cards.forEach(card => {
                        new Card(card.id, card.attributes.category, card.attributes.image, card.attributes.matched, card.attributes.player.id, card.attributes.player.role, card.attributes.month)
                    })
                })
            })
            .then(resp => Card.addPlayCardEventToUser())
    }

    static async updateCardPlayerToBoard(card) {
        return fetch(`http://localhost:3000/cards/${card.data.id}`, {
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
    }

    static async fetchRandomCardFromDeck() {
        return fetch(`http://localhost:3000/players/${game.deck.id}/cards`)
        .then(resp => resp.json())
    }
}