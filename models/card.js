class Card {
    constructor(id, category, image, matched, playerId, month) {
        this.id = id;
        this.category = category;
        this.image = image;
        this.matched = matched; 
        this.playerId = playerId;
        this.month = month;
        this.renderCard();
        this.addToCardSummary()
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

            cardContainer.appendChild(cardImg)
        }
    }

    addToCardSummary() {
        const cardMonth = downcaseFirstLetter(this.month);
        const parentMonthDiv = document.getElementById(cardMonth);
        parentMonthDiv.appendChild(this.createCardImgHtml())

        const cardCategory = this.category;
        const parentCategoryDiv =  document.getElementsByClassName(cardCategory)[0];
        parentCategoryDiv.appendChild(this.createCardImgHtml())
    }

    createCardImgHtml() {
        let cardImg = document.createElement('img');
        cardImg.setAttribute('src', this.image);
        cardImg.style.maxWidth = "45px";
        return cardImg;
    }
};


function downcaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}