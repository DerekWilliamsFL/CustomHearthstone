const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const path = require('path');
const fs = require('fs');
//const snoowrap = require('./credentials');
//const reddit = snoowrap.reddit;
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test', (err) => {
  if (!err) {
    console.log('Connected');
  };
});

const app = express();
require('./routes')(app);
require('./models/User');
app.use(express.static(process.cwd() + '/public'));


const getCardImages = (url) => {
  console.log('Running GCI');
  return new Promise( (resolve, reject) =>
    request(url, (error, res, body) => {
      if(error) {
        reject(console.log("Error: " + error));
      }
      else { console.log('No Error') }

      const $ = cheerio.load(body);
      const imageArray = [];

      
      $('div#siteTable > div.link').each( function( i, index ){
        let image = $(this).attr('data-url');
        let score = $(this).find('div.score.unvoted').text().trim();
        let user = $(this).find('a.author').text().trim();
        let title = $(this).find('p.title').text().trim();
        var link = $(this).find('a.comments').attr('href');
        console.log(link);
        let thread = { image, score, user, title, link };
        imageArray.push(thread);
        return i < 6;
      });
      
      imageArray.forEach( function(thread, index, arr) {
        let img = thread.image;;
        
        console.log(img.indexOf('comments'));

        if (img.indexOf('/a/') >= 0 || img.indexOf('comments') >= 0) {
          return arr.splice(index, 1);
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
      imageArray.splice(0, 1);
      resolve(imageArray);
    })
  );
}



app.get('/cards', (req, res) => {
  getCardImages("https://www.reddit.com/r/customhearthstone")
  .then((result) => {
    res.json(result);
    res.end();
  });
  
});



app.post('/top', (req, res) => {
  console.log(req.body);
  //getCardImages("https://www.reddit.com/r/customhearthstone/top/?sort=top&t=day");
  
  res.end();
});

app.get('/login', (req, res) => {

  res.end();
});

app.listen(4321);