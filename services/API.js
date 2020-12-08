class API {

    static async addPlayersAndCards(){
        this.loadPlayers();
        this.loadCards();
    };

    static async loadCards() {
        fetch("http://localhost:3000/cards")
        .then(resp => resp.json())
        .then(cards => {
            API.createCards(cards);
        })
    };

    static async loadPlayers() {
        fetch("http://localhost:3000/players")
        .then(resp => resp.json())
        .then(players => {
            API.createPlayers(players);
        }) 
    };

    static async createPlayers(players) {
        players.data.forEach(player => {
            new Player(player.id, player.attributes.role, player.attributes.username)
        })
    };

    static async createCards(cards) {
        cards.data.forEach(card => {
            new Card(card.id, card.attributes.category, card.attributes.image, card.attributes.matched, card.relationships.player.data.id, card.attributes.month)
        })
    };

    static async createCardSummary(cards) {
        fetch("http://localhost:3000/cards")
            .then(resp => resp.json())
            .then(cards => {
               cards.data.forEach(card => {
                API.loadCardsToSummary(card);
               })
            }) 
    };

    static loadUserName() {
        fetch("http://localhost:3000/games")
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
                    debugger
                    new Player(player.id, player.attributes.role, player.attributes.username)
                })
                players.data.forEach(player => {
                    player.attributes.cards.forEach(card => {
                        new Card(card.id, card.category, card.image, card.matched, card.player_id, card.month)
                    })
                })
            })
            .then(resp => Card.addPlayCardEventToUser())
    }

    static loadCardsToSummary(card) {
        const cardMonth = downcaseFirstLetter(card.month);
        const parentMonthDiv = document.getElementById(cardMonth);

        let cardMonthImg = document.createElement('img');
        cardMonthImg.setAttribute('src', card.image);
        cardMonthImg.style.maxWidth = "45px";
        parentMonthDiv.appendChild(cardMonthImg)
    
        const cardCategory = card.category;
        const parentCategoryDiv =  document.getElementsByClassName(cardCategory)[0];

        let cardCategoryImg = document.createElement('img');
        cardCategoryImg.setAttribute('src', card.image);
        cardCategoryImg.style.maxWidth = "45px";
        parentCategoryDiv.appendChild(cardCategoryImg)
    }
}