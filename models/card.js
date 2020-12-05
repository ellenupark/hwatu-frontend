class Card {
    constructor(id, category, image, matched, playerId, month) {
        this.id = id;
        this.category = category;
        this.image = image;
        this.matched = matched; 
        this.playerId = playerId;
        this.month = month;
        this.renderCard();
        // this.addToCardSummary()
    };


    renderCard() {
        const cardContainer = document.getElementById(`player-${this.playerId}`);
        const cardImg = document.createElement('img')

        if (this.playerId == deck.id) {
            if (cardContainer.childElementCount === 0) {
                cardImg.setAttribute('src', "https://i.ibb.co/QJ2J9d2/cardback.png");
                cardContainer.appendChild(cardImg)
            }
        } else {
            cardImg.classList.add(this.month)
            cardImg.classList.add(this.category)
            cardImg.id = this.id
            cardImg.setAttribute('src', this.image)
            if (this.playerId == user.id) {
                cardImg.addEventListener('click', this.playCard)
            }

            cardContainer.appendChild(cardImg)
        }
    }

    // addToCardSummary() {
    //     const cardMonth = downcaseFirstLetter(this.month);
    //     const parentMonthDiv = document.getElementById(cardMonth);
    //     parentMonthDiv.appendChild(this.createCardImgHtml())

    //     const cardCategory = this.category;
    //     const parentCategoryDiv =  document.getElementsByClassName(cardCategory)[0];
    //     parentCategoryDiv.appendChild(this.createCardImgHtml())
    // }

    createCardImgHtml() {
        let cardImg = document.createElement('img');
        cardImg.setAttribute('src', this.image);
        cardImg.style.maxWidth = "45px";
        return cardImg;
    }

    playCard() {
        fetch(`http://localhost:3000/cards/${this.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                player_id: board.id
            })
        })
        .then(function(data) {
            Card.loadPlayerCards(board)
            Card.loadPlayerCards(user)
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
        let playerDiv = document.getElementById(`player-${player.data.id}`);
        playerDiv.innerHTML = "";
    
        player.data.attributes.cards.forEach(function(card) {
            new Card(card.id, card.category, card.image, card.matched, card.player_id, card.month)
        });
    }


};


function downcaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function loadPlayerCards(player) {
    fetch(`http://localhost:3000/players/${player.id}`)
    .then(resp => resp.json())
    .then(function(resp) {
        loadPlayerCardsHtml(resp)
    })
}

function loadPlayerCardsHtml(player) {
    let playerDiv = document.getElementById(`player-${player.data.id}`);
    playerDiv.innerHTML = "";

    player.data.attributes.cards.forEach(function(card) {
        let newImg = document.createElement("img");
        newImg.setAttribute('src', card.image)
        newImg.addEventListener('click', playCard());
        playerDiv.appendChild(newImg)
    });
}