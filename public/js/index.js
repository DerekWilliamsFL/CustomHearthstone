(function() {
  window.blue = function () {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "http://localhost:4321/cards");
    oReq.setRequestHeader("Content-type", "application/json");
    oReq.send();
    oReq.onreadystatechange = function () {
    if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
        var blue = JSON.parse(oReq.responseText);
        var chs = document.getElementById('cards');
        chs.innerHTML = '';
        blue.forEach(function(element) {
          chs.innerHTML += 
          "<a class='results' href='" + element.link + "'>" + 
            "<div class='buttons'><i class='fa fa-heart' aria-hidden='true'></i>" + 
            "<i class='fa fa-times' aria-hidden='true'></i></div>" + 
            "<img alt='" + element.title + "' src='" + element.image +"'/>" +
          "</a>"
        });
      } else {
        console.log('Error: ' + oReq.status);
      }
    }
  }

  window.red = function (event) {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "http://localhost:4321/category");
    oReq.setRequestHeader("Content-type", "application/json");
    var url = event.target.attributes[2].nodeValue;
    var data = JSON.stringify({url: url});
    oReq.send(data);
    oReq.onreadystatechange = function () {
    if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
        var blue = JSON.parse(oReq.responseText);
        var chs = document.getElementById('cards');
        chs.innerHTML = '';
        blue.forEach(function(element) {
          chs.innerHTML += 
          "<a class='results' href='" + element.link + "'>" + 
            "<div class='buttons'><i class='fa fa-heart' aria-hidden='true'></i>" + 
            "<i class='fa fa-times' aria-hidden='true'></i></div>" + 
            "<img alt='" + element.title + "' src='" + element.image +"'/>" +
          "</a>"
        });
      } else {
        console.log('Error: ' + oReq.status);
      }
    }
  }

  window.like = function (event) {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "http://localhost:4321/likes");
    oReq.setRequestHeader("Content-type", "application/json");
    var url = event.target.attributes[2].nodeValue;
    var data = JSON.stringify({url: url});
    oReq.send(data);
    oReq.onreadystatechange = function () {
    if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
        var blue = JSON.parse(oReq.responseText);
        var chs = document.getElementById('cards');
        chs.innerHTML = '';
        blue.forEach(function(element) {
          chs.innerHTML += 
          "<a class='results' href='" + element.link + "'>" + 
            "<div class='buttons'><i class='fa fa-heart' aria-hidden='true'></i>" + 
            "<i class='fa fa-times' aria-hidden='true'></i></div>" + 
            "<img alt='" + element.title + "' src='" + element.image +"'/>" +
          "</a>"
        });
      } else {
        console.log('Error: ' + oReq.status);
      }
    }
  }

  window.dislike = function (event) {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "http://localhost:4321/dislikes");
    oReq.setRequestHeader("Content-type", "application/json");
    var url = event.target.attributes[2].nodeValue;
    var data = JSON.stringify({url: url});
    oReq.send(data);
    oReq.onreadystatechange = function () {
    if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
        var blue = JSON.parse(oReq.responseText);
        var chs = document.getElementById('cards');
        chs.innerHTML = '';
        blue.forEach(function(element) {
          chs.innerHTML += 
          "<a class='results' href='" + element.link + "'>" + 
            "<div class='buttons'><i class='fa fa-heart' aria-hidden='true'></i>" + 
            "<i class='fa fa-times' aria-hidden='true'></i></div>" + 
            "<img alt='" + element.title + "' src='" + element.image +"'/>" +
          "</a>"
        });
      } else {
        console.log('Error: ' + oReq.status);
      }
    }
  }
})();


