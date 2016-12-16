const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
module.exports = function(app){

app.get('/', (req, res) => { 
  console.log(__dirname);
  res.sendFile((process.cwd() + '/public/views/index.html'));
});

}