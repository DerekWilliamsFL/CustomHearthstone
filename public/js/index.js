
window.blue = function () {
  console.log('index');
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "http://localhost:4321/cards");
  oReq.send();
  oReq.onreadystatechange = function () {
  if (oReq.readyState === XMLHttpRequest.DONE) {
    if (oReq.status === 200) 
      console.log(JSON.parse(oReq.responseText)); // 'This is the returned text.'

      var chs = document.getElementsByClassName('customhearthstone');
      console.log(chs);
      chs.innerHTML += "Done";
    } else {
      console.log('Error: ' + oReq.status); // An error occurred during the request.
    }
}
}

