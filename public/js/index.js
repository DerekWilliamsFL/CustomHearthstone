
window.blue = function () {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "http://localhost:4321/cards");
  oReq.send();
  oReq.onreadystatechange = function () {
  if (oReq.readyState === XMLHttpRequest.DONE) {
    if (oReq.status === 200) 
      var blue = JSON.parse(oReq.responseText);
      console.log(blue);
      var chs = document.getElementById('customhearthstone');
      blue.forEach(function(element) {
      chs.innerHTML += 
        "<a href='" + element.link + "'>" + 
          "<img alt='" + element.title + "' src='" + element.image +"'/>" +
        "</a>"
      });
    } else {
      console.log('Error: ' + oReq.status);
    }
}
}

