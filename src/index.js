const gameForm = document.getElementById("form")
const formName = document.getElementById("username")
const playerURL = "http://localhost:3000/players"
const welcomeDiv = document.getElementById("welcome")
const mainGameDiv = document.getElementById('main-game')
const navBar = document.getElementById('nav-bar')
const gameURL = "http://localhost:3000/games"

document.addEventListener("DOMContentLoaded", function() {
  prepareGame();
});

const prepareGame = async () => {
  await API.loadPlayers();
  await Card.dealCards();
  document.getElementById('welcome-div').classList.remove('hidden');
  loadGame();
}

function loadGame() {
  gameForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const formResults = getInfo(event);
    let url = gameURL;
    
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json"
      },
      body: JSON.stringify(formResults)
    };

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
      .catch(alert);
  });
};

function getInfo(event) {
  return {
    name: formName.value,
  };
};

function revealBoard() {
  document.getElementById('player-pairs').innerText = `${game.name}'s Sets`;
  welcomeDiv.classList.add("hidden")
  mainGameDiv.classList.remove('hidden')
  navBar.classList.remove('hidden')
};

$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})