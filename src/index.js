document.addEventListener("DOMContentLoaded", function(){
    // loadPosts()
    loadFormlistener()
    createCardList()
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
        url = playerURL

        // fetch our results to the back end
        fetch(url, options)
        .then(resp => resp.json())
        .then(data => {
          if (!data.errors){
              welcomeDiv.classList.add("hidden")
              mainGameDiv.classList.remove('hidden')
              navBar.classList.remove('hidden')
          } else {
            throw new Error( `${data.errors}`)
          }
        })
        .catch(alert)
    })  
}

function getInfo(event){
    return {
        role: 'user',
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