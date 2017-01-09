
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
const cacheJson = fs.readFileSync('./reddit.json', 'utf-8');
const cacheTime = JSON.parse(cacheJson)[3];
const CHS = require('./CHS.js');

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

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/public/views'));
//require('./routes')(app);

app.get('/', (req, res) => { 
  let username;
  req.user ? username = req.user.username : username = undefined;
  console.log(username);

  const oneHourCache = cacheTime + 1000 * 60 * 60 > Date.now();
  console.log(`OHC ${oneHourCache}`);
  if (oneHourCache) {
    const cache = JSON.parse(cacheJson);
    const threads = cache[0].concat(cache[1]);
    const cards = cache[2];
    
    /* Template */ res.render('index', {threads: threads, hotCards: cards, username: username});
    // React = res.json({"data": data, "username": username}); 
  } else {
    Promise.all([CHS.getThreads("hearthstone"), CHS.getThreads("competitivehearthstone"), CHS.getCards("customhearthstone")])
    .then((results) => {
      console.log(results[1]);
      const threads = results[0].concat(results[1]);
      const cards = results[2];
      CHS.writeCache(results);
      res.render('index', {threads: threads, hotCards: cards, username: username});
      // React = res.json({"data": data, "username": username}); 
    })
    .catch((error) => { 
      console.log('Error occured on /.');
      res.end();
    });
  }
});

app.get('/cards', (req, res) => {
  CHS.getCards("customhearthstone")
  .then((result) => {
    res.json(result);
    res.end();
  })
  .catch((error) => console.log('Error occured on /cards.'));
});

app.get('/likes', CHS.checkUser, (req, res) => {
  res.json(req.user.likedCards);
  res.end();
});

app.post('/likes', CHS.checkUser, (req, res) => {
  console.log(req.body);
  req.user.likedCards.push(req.body);
  req.user.save(function(err, user) {
    err ? console.log(err) : console.log(req.user.likedCards);
  });
  res.end();
});

app.get('/dislikes', CHS.checkUser, (req, res) => {
  res.json(req.user.dislikedCards);
  res.end();
});


app.post('/dislikes', CHS.checkUser, (req, res) => {
  req.user.dislikedCards.push(req.body);
  req.user.save(function(err, user) {
    err ? console.log(err) : console.log(req.user.dislikedCards);
  });
  res.end();
});


app.post('/category', (req, res) => {
  CHS.getCards(req.body.url)
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
    err ? console.log(err) : console.log(`User accounts: ${users}`);
  });
  res.end();
});

app.listen(4321);