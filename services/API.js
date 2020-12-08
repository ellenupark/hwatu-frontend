class API {

    static addPlayersAndCards(){
        this.loadPlayers()
        this.loadCards();
    };

    static async loadCards() {
        let cards = await Card.dealCards();
        return API.createCards(cards);
    };

    static loadPlayers() {
        fetch("http://localhost:3000/players")
        .then(resp => resp.json())
        .then(players => {
            API.createPlayers(players);
            return players;
        }) 
    };

    static createPlayers(players) {
        players.data.forEach(player => {
            new Player(player.id, player.attributes.role)
        })
    };

    static createCards(cards) {
        cards.data.forEach(card => {
            new Card(card.id, card.attributes.category, card.attributes.image, card.attributes.matched, card.attributes.player.id, card.attributes.player.role, card.attributes.month)
        })
        return cards;
    };

    static createCardSummary() {
        fetch("http://localhost:3000/cards")
            .then(resp => resp.json())
            .then(cards => {
               cards.data.forEach(card => {
                API.loadCardsToSummary(card);
               })
               return cards;
            }) 
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
    // static async addPlayersAndCards(){
    //     fetch("http://localhost:3000/players")
    //         .then(resp => resp.json())
    //         .then(players => {
    //             players.data.forEach(player => {
    //                 new Player(player.id, player.attributes.role, player.attributes.username)
    //             })
    //             players.data.forEach(player => {
    //                 player.attributes.cards.forEach(card => {
    //                     new Card(card.id, card.category, card.image, card.matched, card.player_id, card.month)
    //                     API.loadCardsToSummary(card);
    //                 })
    //             })
    //         }) 
    // }

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

    static loadCardsToSummary(card) {
        const cardMonth = downcaseFirstLetter(card.attributes.month);
        const parentMonthDiv = document.getElementById(cardMonth);

        let cardMonthImg = document.createElement('img');
        cardMonthImg.setAttribute('src', card.attributes.image);
        cardMonthImg.style.maxWidth = "45px";
        parentMonthDiv.appendChild(cardMonthImg)
    
        const cardCategory = card.attributes.category;
        const parentCategoryDiv =  document.getElementsByClassName(cardCategory)[0];

        let cardCategoryImg = document.createElement('img');
        cardCategoryImg.setAttribute('src', card.attributes.image);
        cardCategoryImg.style.maxWidth = "45px";
        parentCategoryDiv.appendChild(cardCategoryImg)
    }
}