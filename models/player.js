class Player {
    constructor(id, role) {
        this.id = id;
        this.role = role;
        this.renderPlayer();
        game.add(this)
    };

    renderPlayer(){
        let playerDiv = document.getElementById(`${this.role}-container`)
        playerDiv.classList.add(`player-${this.id}`);
    };
};
