class Player {
    constructor(id, role) {
        this.id = id;
        this.role = role;
        this.cards = [];
        this.renderPlayer();
        game.add(this)
    };

    add(card){
        this.cards.push(card);
        return card;
    }

    renderPlayer(){
        let playerDiv = document.getElementById(`${this.role}-container`)
        playerDiv.classList.add(`player-${this.id}`);
    };

    static createPlayers(players) {
        return players.data.map(player => new Player(player.id, player.attributes.role));
    };
};
