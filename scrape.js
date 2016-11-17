const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const fs = require('fs');
const app = express();



const getCardImages = (url) => {
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
        if (image.indexOf('imgur') >= 0) {
        let score = $(this).find('div.score.unvoted').text().trim();
        let user = $(this).find('a.author').text().trim();
        imageArray.push(image);
        }
      });
      resolve(imageArray);
    })
  );
}

//  Routes  //

app.get('/', (request, response) => { 
  getCardImages("https://www.reddit.com/r/customhearthstone")
  .then(result => {
    console.log("Success - THEN", result[0]);
    response.set('Content-Type', 'text/html');
    response.send("<img src='" + result[0] + "'/>");
  });
});

app.get('/top', (req, res) => getCardImages("https://www.reddit.com/r/customhearthstone/top/?sort=top&t=day"));

app.listen(6587);