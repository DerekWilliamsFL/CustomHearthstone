const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
require('./routes.js')(app);



const getCardImages = (url) => {
  console.log('Running GCI');
  return new Promise( (resolve, reject) =>
    request(url, (error, res, body) => {
      if(error) {
        reject(console.log("Error: " + error));
      }
      console.log("Status code: " + res.statusCode);

      const $ = cheerio.load(body);
      const imageArray = [];

      $('div#siteTable > div.link').each(function( index ) {
        let image = $(this).attr('data-url');
        let title = $(this).find('p.title').text().trim();
        let score = $(this).find('div.score.unvoted').text().trim();
        let user = $(this).find('a.author').text().trim();
        let thread = {image, title, score, user};
        imageArray.push(thread);
      });
      console.log(imageArray);
      imageArray.forEach(function(thread, index, arr){
        let img = thread.image;
        if (img.indexOf('/a/') >= 0) {
          console.log(arr[index]);
          arr.splice(index, 1);
          return;
        };
        if(img.indexOf('i.imgur' === -1 ) && (img.indexOf('imgur') > -1)){
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



app.get('/cards', (req, res) => {
  getCardImages("https://www.reddit.com/r/customhearthstone")
  .then(result => {
    console.log("Success - THEN", result);
    res.set('Content-Type', 'text/html');
    result.forEach(val => res.write("<img width='150' alt='" + val.title + "' src='" + val.image + "'/>"));
    res.write("<img width='150' src='https://i.redd.it/tfsak3ixxdyx.png' />");
    res.end();
  });
});



app.get('/top', (req, res) => {
  getCardImages("https://www.reddit.com/r/customhearthstone/top/?sort=top&t=day");
  res.end();
});

app.listen(4321);