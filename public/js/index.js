const CHS = {

  getThreads: () => {
    fetch('http://localhost:4321/threads', {
       method: 'GET',
       headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    .then((response => response.json()))
    .then((response => console.log(response)))
    .catch((err => console.log(err)))
  },

  renderCards: (array) => {
    const chs = document.getElementById('cards');
    chs.innerHTML = '';
    console.log(array);
    array.forEach(function(card) {
      var blue = $($.parseHTML(
        `<div class='card'>
          <div class='buttons'>
            <i class='fa fa-heart' onclick='CHS.like(event)' aria-hidden='true'></i>
            <span>${card.score}</span>
            <i class='fa fa-times' aria-hidden='true'></i>
          </div> 
          <a class='results' href='${card.link}'>
            <img alt='${card.title}' src='${card.image}'/>
            <p>${card.title}</p>
          </a>
        </div>`));
        chs.append(blue);
    });
  },

  getCategory: (event) => {
    fetch('http://localhost:4321/category', {
       method: 'POST',
       headers: new Headers({ 'Content-Type': 'application/json' }),
       body: JSON.stringify({url: event.target.attributes[2].nodeValue})
    })
    .then((response => response.json()))
    .then((response => CHS.renderCards(response)))
    .catch((err => console.log(err)))
  },

  like: (event) => {
    const link = event.path[2].childNodes[2].href;
    const image = event.path[2].childNodes[2].firstChild.src;
    const title = event.path[2].childNodes[2].text;
    const score = event.path[2].childNodes[1].textContent;

    const data = JSON.stringify({"link": link, "image": image, "title": title, "score": score});
    fetch('http://localhost:4321/likes', {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: data
    })
    .then((response => response.json()))
    .then((response => console.log('Liked! <3')))
    .catch((err => console.log(err)))
  },

  showLikes: () => {
    fetch('http://localhost:4321/likes', {
       method: 'GET',
       headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    .then((response => response.json()))
    .then((response => CHS.renderCards(response)))
    .catch((err => console.log(err)))
  },

  dislike: (event) => {
    const link = event.path[2].childNodes[2].href;
    const image = event.path[2].childNodes[2].firstChild.src;
    const title = event.path[2].childNodes[2].text;
    const score = event.path[2].childNodes[1].textContent;
    const data = JSON.stringify({"link": link, "image": image, "title": title, "score": score});

    fetch('http://localhost:4321/dislikes', {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: data
    })
    .then((response => response.json()))
    .then((response => console.log('Disliked! X')))
    .catch((err => console.log(err)))
  }
};


