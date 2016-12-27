const express = require('express');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
module.exports = function(app){

app.get('/', (req, res) => { 
  res.sendFile(path.join(__dirname, '/public/views/index.html'));
});

}