
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
const User = require('./models/User');


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test', (err) => {
  err ? console.log('Error connecting to Mongo.') : console.log('Connected.');
});

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
app.set('view engine', 'html');

require('./routes')(app);



app.listen(4321);