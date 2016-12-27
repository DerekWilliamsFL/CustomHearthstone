const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test', (err) => {
  if (!err) {
    console.log('Connected');
  };
});

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, required: true, unique: true },
  password: { type: String, lowercase: true, required: true, unique: true },
});

const User = mongoose.model('User', UserSchema);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '/public')));

require('./routes')(app);


const getCardImages = (url) => {
  return new Promise( (resolve, reject) =>
    request(url, (error, res, body) => {
      if(error) {
        reject(console.log("Error: " + error));
      }

      const $ = cheerio.load(body);
      const imageArray = [];

      
      $('div#siteTable > div.link:not(.stickied)').each( function( i, index ){
        let image = $(this).attr('data-url');
        let score = $(this).find('div.score.unvoted').text().trim();
        let user = $(this).find('a.author').text().trim();
        let title = $(this).find('p.title').text().trim();
        let link = $(this).find('a.comments').attr('href');
        let thread = { image, score, user, title, link };
        imageArray.push(thread);
        return i < 4;
      });
      
      imageArray.forEach( function(thread, index, arr) {
        let img = thread.image;
        if ((img.indexOf('/a/') >= 0) || (img.indexOf('comments') >= 0)) {
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
}



app.get('/cards', (req, res) => {
  getCardImages("https://www.reddit.com/r/customhearthstone")
  .then((result) => {
    res.json(result);
    res.end();
  });
});



app.post('/category', (req, res) => {
  getCardImages(req.body.url)
  .then((result) => {
    res.json(result);
    res.end();
  });
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username) { res.status(422).send({ error: 'Please enter an email address.' })}
  if (!password) { res.status(422).send({ error: 'Please enter a password.' })}

  User.findOne({username: username}, function (err, existingUser){
    if (err) return console.log(err);
    if (existingUser) return console.log('Username in use: ' +existingUser);
    let newUser = new User({username: username, password: password});
    newUser.save(function(err, user) {
      if (err) { return console.log(err); }
      else { console.log('New user created: ' + user); }
    });
  });
  res.end();
});

app.get('/readUsers', (req, res) => {
  User.find(function (err, users){
    if (err) return console.log(err);
    console.log('User accounts: ' + users);
  });
  res.end();
});

app.listen(4321);