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

function sample(array) {
  return array[Math.floor ( Math.random() * array.length )]
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function downcaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}