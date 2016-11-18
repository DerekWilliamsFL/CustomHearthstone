const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.static(__dirname + '/public'));

module.exports = function(app){
//  Routes  //


app.get('/', (req, res) => { 
  console.log('routes working');
  res.sendFile((process.cwd() + '/public/views/index.html'));
});

}