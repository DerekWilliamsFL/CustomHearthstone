
window.blue = function () {
  console.log('index');
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "http://localhost:4321/cards");
  oReq.send();
  oReq.onreadystatechange = function () {
  if (oReq.readyState === XMLHttpRequest.DONE) {
    if (oReq.status === 200) 
      var blue = JSON.parse(oReq.responseText); // 'This is the returned text.'
      console.log(blue);
      var first = blue[2];
      console.log(first);
      var chs = document.getElementById('customhearthstone');
      var image = document.createElement('img');
      image.innerHTML = 
        "<a href='" + first.link + "'>" + 
          "<img width='150' alt='" + first.title + "' src='http://i.imgur.com/zpaTClv.png'/>" +
        "</a>"
      chs.appendChild(image);
    } else {
      console.log('Error: ' + oReq.status); // An error occurred during the request.
    }
}
}

