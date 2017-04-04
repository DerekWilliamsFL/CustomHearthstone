const express = require('express');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const CHS = require('./CHS.js');
const cacheJson = fs.readFileSync('./reddit.json', 'utf-8');
const cacheTime = JSON.parse(cacheJson)[3];
const User = require('./models/User');
const Snoo = require('snoowrap');

const app = express();

function checkUser(req, res, next) {
  if (req.user !== undefined) {
    next();
  } else {
    res.json('You are not logged in');
  }
}

module.exports = function(app){

  app.get('/', (req, res) => {
      res.sendFile('public/views/index.html', { root: __dirname });
  });

  app.get('/threads', (req, res) => {

    let username;
    req.user ? username = req.user.username : username = undefined;
    const oneHourCache = cacheTime + 1000 * 60 * 60 > Date.now();
    if (oneHourCache) {
      const cache = JSON.parse(cacheJson);
      res.json(cache);
      res.end();
    } else {
      Promise.all([CHS.getThreads("hearthstone"), CHS.getThreads("competitivehs"), CHS.getCards("customhearthstone")])
      .then((results) => {
        CHS.writeCache(results);
        res.json(results);
        res.end();
      })
      .catch((error) => { 
        console.log('Error occured on /threads.');
        res.end();
      });
    }
  });

  app.post('/category', (req, res) => {
    CHS.getCards(req.body.url)
    .then((result) => {
      res.json(result);
      res.end();
    })
    .catch((error) => console.log('Error occured on /category.'));
  });

  app.get('/dislikes', checkUser, (req, res) => {
    res.json(req.user.dislikedCards);
    res.end();
  });

  app.post('/dislikes', checkUser, (req, res) => {
    req.user.dislikedCards.push(req.body);
    req.user.save(function(err, user) {
      err ? console.log(err) : console.log(req.user.dislikedCards);
    });
    res.end();
  });

  app.get('/likes', checkUser, (req, res) => {
    res.json(req.user.likedCards);
    res.end();
  });

  app.post('/likes', checkUser, (req, res) => {
    req.user.likedCards.push(req.body);
    req.user.save(function(err, user) {
      err ? console.log(err) : console.log(req.user.likedCards);
    });
    res.end();
  });

  app.post('/login', passport.authenticate('local', { 
      successRedirect: '/',                               
      failureFlash: true
      }),
    );

  app.get('/readUsers', (req, res) => {
    User.find(function (err, users){
      err ? console.log(err) : console.log(`User accounts: ${users}`);
    });
    res.end();
  });

}