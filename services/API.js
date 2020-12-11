class API {
    static async loadPlayers() {
        let playersData = await fetch("http://localhost:3000/players").then(resp => resp.json());
        return Player.createPlayers(playersData);
    };

    static async retrieveAllCards() {
        const resp = await fetch("http://localhost:3000/cards");
        return await resp.json();
    }

    static async createCardSummary() {
        return fetch("http://localhost:3000/cards")
            .then(resp => resp.json())
            .then(cards => cards.data.forEach(card => API.loadCardsToSummary(card)))
    };

    static async loadUserName() {
        return fetch("http://localhost:3000/games")
            .then(resp => resp.json())
            .then(cards => {
               cards.data.forEach(card => {
                API.loadCardsToSummary(card);
               })
            }) 
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