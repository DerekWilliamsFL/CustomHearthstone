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
const session = require('express-session');
const pug = require('pug');
let jsonCache = fs.readFileSync('./reddit.json', 'utf-8');
let cacheTime = JSON.parse(jsonCache)[2];
console.log(cacheTime);
console.log(Date.now());
cacheTime + 1000 * 60 * 60 > Date.now() ? console.log('Cached') : console.log('Not cached');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test', (err) => {
  err ? console.log('Error connecting to Mongo.') : console.log('Connected.');
});

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, required: true, unique: true },
  password: { type: String, lowercase: true, required: true, unique: true },
  likedCards: [{
    link: String,
    image: String,
    title: String,
    score: String
  }],
  dislikedCards: [{
    link: String,
    image: String,
    title: String,
    score: String
  }],
});

const User = mongoose.model('User', UserSchema);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({ 
  secret: 'wow',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({username: username}, function (err, existingUser){
    if (err) { return done(err) };
    if (existingUser) { return done(null, existingUser) };
    let newUser = new User({ username: username, password: password, likedCards: [], dislikedCards: [] });
    newUser.save(function(err, user) {
      if (err) { return done(err) }
      else { console.log(`New user created: ${user}`) }
    return done(err);
    });
  });
}));

function loggedIn(req, res, next) {
  if (req.user !== undefined) {
    req.session.username = req.user.username
    next();
  } else {
    req.session.username = undefined;
    next();
  }
}

function writeCache(json) {
  json[2] = Date.now();
  fs.writeFile('reddit.json', JSON.stringify(json), (err) => {
    err ? console.log('wrtieCache error.') : console.log('writeCache worked.');
  });
}

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/public/views'));
//require('./routes')(app);


const getCardImages = (url) => {
  return new Promise( (resolve, reject) =>
    request(url, (error, res, body) => {
      if(error) {
        reject(console.log(`Error: ${error}`));
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
        return i < 5;
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

const getThreads = (url) => {
  return new Promise( (resolve, reject) =>
    request(url, (error, res, body) => {
      if(error) {
        reject(console.log(`Error: ${error}`));
      }

      const $ = cheerio.load(body);
      const imageArray = [];

      
      $('div#siteTable > div.link:not(.stickied)').each( function( i, index ){
        let image = $(this).find('a.thumbnail img').attr('src');
        let score = $(this).find('div.score.unvoted').text().trim();
        let user = $(this).find('a.author').text().trim();
        let title = $(this).find('p.title').text().trim();
        let link = $(this).find('a.comments').attr('href');
        let thread = { image, score, user, title, link };
        imageArray.push(thread);
        return i < 2;
      });
      
      imageArray.forEach( function(thread, index, arr) {
        let img = thread.image;
        if (img == undefined) {
          return arr[index].image = "/views/logo.png";
        };
      });
      resolve(imageArray);
    })
  );
}

app.get('/', loggedIn, (req, res) => { 
  const username = req.session.username;
  if (cacheTime + 1000 * 60 * 60 > Date.now()) {
    console.log('Using cache');
    const cache = JSON.parse(jsonCache);
    const data = {
      threads: cache[0].concat(cache[1]),
      cards: cache[2]
    }
    res.render('index', {threads: data.threads, hotCards: data.cards, username: username});
  } else {
    console.log('Scraping');
    Promise.all([getThreads("https://www.reddit.com/r/hearthstone"), getThreads("https://www.reddit.com/r/rupaulsdragrace"), getCardImages("https://www.reddit.com/r/customhearthstone")])
    .then((results) => {
      const threads = results[0].concat(results[1]);
      const cards = results[2];
      writeCache(results);
      cacheTime = Date.now();
      res.render('index', {threads: threads, hotCards: cards, username: username});
    })
    .catch((error) => { 
      console.log('Error occured on /.');
      res.end();
    });
  }
});

app.get('/cards', (req, res) => {
  getCardImages("https://www.reddit.com/r/customhearthstone")
  .then((result) => {
    res.json(result);
    res.end();
  })
  .catch((error) => console.log('Error occured on /cards.'));
});

app.get('/likes', loggedIn, (req, res) => {
  res.json(req.user.likedCards);
  res.end();
});

app.post('/likes', loggedIn, (req, res) => {
  req.user.likedCards.push(req.body);
  req.user.save(function(err, user) {
    if (err) { return console.log(err); }
    else { return console.log(req.user.likedCards); }
  });
  res.end();
});

app.get('/dislikes', loggedIn, (req, res) => {
  res.json(req.user.dislikedCards);
  res.end();
});


app.post('/dislikes', loggedIn, (req, res) => {
  req.user.dislikedCards.push(req.body);
  req.user.save(function(err, user) {
    if (err) { return console.log(err); }
    else { return console.log(req.user.dislikedCards); }
  });
  res.end();
});


app.post('/category', (req, res) => {
  getCardImages(req.body.url)
  .then((result) => {
    res.json(result);
    res.end();
  })
  .catch((error) => console.log('Error occured on /category.'));
});


app.post('/login', passport.authenticate('local', { 
    successRedirect: '/',                               
    failureFlash: true
    }),
  );

app.get('/readUsers', (req, res) => {
  User.find(function (err, users){
    if (err) return console.log(err);
    console.log(`User accounts: ${users}`);
  });
  res.end();
});

app.listen(4321);