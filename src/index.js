document.addEventListener("DOMContentLoaded", function() {
  prepareGame();
})

const gameForm = document.getElementById("form")
const formName = document.getElementById("username")
const playerURL = "http://localhost:3000/players"
const welcomeDiv = document.getElementById("welcome")
const mainGameDiv = document.getElementById('main-game')
const navBar = document.getElementById('nav-bar')
const gameURL = "http://localhost:3000/games"

const prepareGame = async () => {
  await API.loadPlayers()
  debugger
  API.createCardSummary()
  Card.dealCards()
  loadGame()
}

function loadGame() {
    gameForm.addEventListener("submit", function(event) {
        event.preventDefault()
        
        // grab text from each field
        const formResults = getInfo(event)
        let options
        let url
        options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Accept": "application/json"
            },
            body: JSON.stringify(formResults)
        }
        url = gameURL;

        // fetch our results to the back end
        fetch(url, options)
        .then(resp => resp.json())
        .then(newGame => {
          if (!newGame.errors){
            game.name = newGame.data.attributes.name
            game.playGame();
            gameForm.reset();
          } else {
            throw new Error( `${newGame.errors}`)
          }
        })
        .then(data => revealBoard())
        .catch(alert)
    })  
}

function getInfo(event) {
  return {
    name: formName.value,
  }
}

function createCardList() {
    fetch(`http://localhost:3000/cards`)
    .then(res => res.json())
    .then(cards => {
      createCardList(cards)
    });
}

function revealBoard() {
  document.getElementById('player-pairs').innerText = `${game.name}'s Sets`;
  welcomeDiv.classList.add("hidden")
  mainGameDiv.classList.remove('hidden')
  navBar.classList.remove('hidden')
};

$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})