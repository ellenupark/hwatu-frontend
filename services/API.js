class API {
    // move our initial fetch into a function here 

    static addPlayersAndCards(){
        fetch("http://localhost:3000/players")
            .then(resp => resp.json())
            .then(players => {
                players.data.forEach(player => {
                    new Player(player.id, player.attributes.role, player.attributes.username)
                })
                players.data.forEach(player => {
                    player.attributes.cards.forEach(card => {
                        new Card(card.id, card.category, card.image, card.matched, card.player_id, card.month)
                    })
                })
            }) 
    }
}