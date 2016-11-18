const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();



const getCardImages = (url) => {
  console.log('Running GCI');
  return new Promise( (resolve, reject) =>
    request(url, (error, response, body) => {
      if(error) {
        reject(console.log("Error: " + error));
      }
      console.log("Status code: " + response.statusCode);

      const $ = cheerio.load(body);
      const imageArray = [];

      $('div#siteTable > div.link').each(function( index ) {
        let image = $(this).find('p.title > a.title').attr('href');
        let redditImage = $(this).find('div.res-expando-box > a.res-expando-link').attr('href');
        let title = $(this).find('p.title').text().trim();
        let score = $(this).find('div.score.unvoted').text().trim();
        let user = $(this).find('a.author').text().trim();
        let object = {image, redditImage, title, score, user};
        imageArray.push(object);
      });
      console.log(imageArray);
      imageArray.forEach(function(object, index, arr){
        let img = object.image;
        if(img.indexOf('i.imgur' === -1 ) && (img.indexOf('imgur') > -1) ){
          let code = img.substr(img.lastIndexOf('/'));
          let base = 'http://i.imgur.com';
          let png = '.png';
          if (code.indexOf('png') === -1) {
            arr[index].image = `${base}${code}${png}`;
          }
        }
      });
      resolve(imageArray);
    })
  );
}

//app.use(express.static('views'));

//  Routes  //

app.get('/', (request, response) => { 
  getCardImages("https://www.reddit.com/r/customhearthstone")
  .then(result => {
    console.log("Success - THEN", result);
    response.set('Content-Type', 'text/html');
    result.forEach(val => response.write("<img width='150' alt='" + val.title + "' src='" + val.image + "'/>"));
    response.write("<img width='150' src='https://i.redd.it/tfsak3ixxdyx.png' />");
    response.send();
  })
  .then(() => {
    console.log('Derek');
    //response.render('./views/index.html');
  })
  
});

app.get('/top', (req, res) => {
  //res.render('/views/index.html');
  getCardImages("https://www.reddit.com/r/customhearthstone/top/?sort=top&t=day")
});

app.listen(4321);