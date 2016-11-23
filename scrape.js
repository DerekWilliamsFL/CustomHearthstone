const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const path = require('path');
const fs = require('fs');
const snoowrap = require('./credentials');
const reddit = snoowrap.reddit;
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

      
      $('div#siteTable > div.link').each( ( i, index ) => {
        let image = $(this).attr('data-url');
        let title = $(this).find('p.title').text().trim();
        let score = $(this).find('div.score.unvoted').text().trim();
        let user = $(this).find('a.author').text().trim();
        let link = $(this).find('p.title').text().trim();
        let thread = {image, title, score, user, link};
        imageArray.push(thread);
        console.log(thread);
        return i < 5;
      });

      console.log($(this));
      
      imageArray.forEach( (thread, index, arr) => {
        let img = thread.image;
        if (img.indexOf('/a/') >= 0) {
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
      resolve(imageArray);
    })
  );
 // reddit.getHot().map(post => post.title).then(console.log);
}



app.get('/cards', (req, res) => {
  getCardImages("https://www.reddit.com/r/customhearthstone")
  .then(result => {
    console.log(result);
    res.set('Content-Type', 'text/html');
    result.forEach(val => res.write(
    `<a href='${val.link}'>
      <img width='150' alt='${val.title}' src='${val.image}'/>
    </a>`
    ));
  });
    res.end();
});



/*app.get('/top', (req, res) => {
  getCardImages("https://www.reddit.com/r/customhearthstone/top/?sort=top&t=day");
  res.end();
});*/

app.get('/login', (req, res) => {

  res.end();
});

app.listen(4321);