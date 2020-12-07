let computer;
let user;
let board;
let deck;

class Player {
    constructor(id, role, username) {
        this.id = id;
        this.role = role;
        this.username = username;
        this.renderPlayer();
        allPlayers.addPlayer(this)
        this.assignPlayerVariable()
    };

    // playerHTML() {
    //     return `
    //       <a href="/hogs/${this.id}"><h2 class="header">${this.name}</h2></a>
    //       <img src="${this.image}" width="100" />
    //       <p>Specialty: ${this.specialty}</p>
    //       <p>Weight as a ratio of hog to LG - 24.7 Cu. Ft. French Door Refrigerator with Thru-the-Door Ice and Water: ${this.weight}</p>
    //       <p>Highest medal achieved: ${this.highest_medal_achieved} </p>
    //       <p>Greased: <input data-id="${this.id}" class="toggle" type="checkbox" value="greased" ${checked} ></p>
    //       <button class="delete">DELETE ME???</button>
    //     `
    // };

    renderPlayer(){
        let playerDiv = document.getElementById(`${this.role}-container`)
        playerDiv.classList.add(`player-${this.id}`);
    };

    assignPlayerVariable() {
        switch (this.role) {
            case 'computer':
                computer = this;
                break;
            case 'user':
                user = this;
                break;
            case 'board':
                board = this;
                break;
            case 'deck':
                deck = this;
                break;
        }   
    }
};

class Players {
    constructor(){
      this.players = []
    }

    // create a new player and save it in the collection
    addPlayer(player){
      this.players.push(player)
      return player
    }

    get all() {
      return this.players
    }
    // this could include summary stats like average score, etc. For simplicy, just the count for now
    get numberOfPlayers(){
        return this.players.length
    }
}  

const allPlayers = new Players();
