const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
module.exports = function(app){
//  Routes  //

app.get('/', (req, res) => { 
  res.sendFile((process.cwd() + '/public/views/index.html'));
  console.log(__filename);
  console.log(__dirname);
});

}