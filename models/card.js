class Card {
    constructor(id, category, image, matched, playerId, month) {
        this.id = id;
        this.category = category;
        this.image = image;
        this.matched = matched; 
        this.playerId = playerId;
        this.month = month;
        this.renderCard();
    };


    renderCard(){
        const cardContainer = document.getElementById(`player-${this.playerId}`);

        const cardImg = document.createElement('img')

        cardImg.classList.add(this.month)
        cardImg.classList.add(this.category)
        cardImg.id = this.id
        cardImg.setAttribute('src', this.image)

        cardContainer.appendChild(cardImg)
    }
};

