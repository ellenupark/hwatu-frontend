document.addEventListener("DOMContentLoaded", function(){
    // loadPosts()
    API.addPlayersAndCards()
    loadFormlistener();
    // API.addPlayersAndCards()
    // createCardList()
    // eventDelegation()
    // buttonEvent()
    // clickEvent()
    // mouseOverEvent()
})

const gameForm = document.getElementById("form")
const formName = document.getElementById("username")
const playerURL = "http://localhost:3000/players"
const welcomeDiv = document.getElementById("welcome")
const mainGameDiv = document.getElementById('main-game')
const navBar = document.getElementById('nav-bar')
const gameURL = "http://localhost:3000/games"


function loadCards() {

}

function loadFormlistener(){
    // identify the form element
    // add the event listener to the form for the form submit
    gameForm.addEventListener("submit", function(event){
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
        .then(data => {
          if (!data.errors){
            revealBoard()
          } else {
            throw new Error( `${data.errors}`)
          }
        })
        .catch(alert)
    })  
}

function getInfo(event){
    return {
      username: formName.value,
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
  welcomeDiv.classList.add("hidden")
  mainGameDiv.classList.remove('hidden')
  navBar.classList.remove('hidden')
}