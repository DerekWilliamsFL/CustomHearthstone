/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(7);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var express = __webpack_require__(2);
	var path = __webpack_require__(3);
	var fs = __webpack_require__(4);
	var passport = __webpack_require__(5);
	var LocalStrategy = __webpack_require__(6).Strategy;

	var app = express();
	module.exports = function (app) {

	  app.get('/', function (req, res) {
	    res.sendFile(path.join(__dirname, '/public/views/index.html'));
	  });
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("passport");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("passport-local");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var request = __webpack_require__(8);
	var cheerio = __webpack_require__(9);
	var express = __webpack_require__(2);
	var bodyParser = __webpack_require__(10);
	var path = __webpack_require__(3);
	var fs = __webpack_require__(4);
	var mongoose = __webpack_require__(11);
	var Schema = mongoose.Schema;
	var passport = __webpack_require__(5);
	var LocalStrategy = __webpack_require__(6).Strategy;

	mongoose.Promise = global.Promise;
	mongoose.connect('mongodb://localhost/test', function (err) {
	  if (!err) {
	    console.log('Connected');
	  };
	});

	var UserSchema = new mongoose.Schema({
	  username: { type: String, lowercase: true, required: true, unique: true },
	  password: { type: String, lowercase: true, required: true, unique: true }
	});

	var User = mongoose.model('User', UserSchema);

	var app = express();
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
	  extended: true
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(path.join(__dirname, '/public')));

	__webpack_require__(1)(app);

	var getCardImages = function getCardImages(url) {
	  return new Promise(function (resolve, reject) {
	    return request(url, function (error, res, body) {
	      if (error) {
	        reject(console.log("Error: " + error));
	      }

	      var $ = cheerio.load(body);
	      var imageArray = [];

	      $('div#siteTable > div.link:not(.stickied)').each(function (i, index) {
	        var image = $(this).attr('data-url');
	        var score = $(this).find('div.score.unvoted').text().trim();
	        var user = $(this).find('a.author').text().trim();
	        var title = $(this).find('p.title').text().trim();
	        var link = $(this).find('a.comments').attr('href');
	        var thread = { image: image, score: score, user: user, title: title, link: link };
	        imageArray.push(thread);
	        return i < 5;
	      });

	      imageArray.forEach(function (thread, index, arr) {
	        var img = thread.image;
	        if (img.indexOf('/a/') >= 0 || img.indexOf('comments') >= 0) {
	          return arr.splice(index, 1);
	        };

	        if (img.indexOf('i.imgur' === -1) && img.indexOf('imgur') > -1) {
	          var code = img.substr(img.lastIndexOf('/'));
	          var base = 'http://i.imgur.com';
	          var png = '.png';
	          if (code.indexOf('png') === -1) {
	            arr[index].image = '' + base + code + png;
	          }
	        }
	      });
	      resolve(imageArray);
	    });
	  });
	};

	app.get('/cards', function (req, res) {
	  getCardImages("https://www.reddit.com/r/customhearthstone").then(function (result) {
	    res.json(result);
	    res.end();
	  });
	});

	app.post('/category', function (req, res) {
	  console.log(req.body);
	  getCardImages(req.body.url).then(function (result) {
	    res.json(result);
	    res.end();
	  });
	});

	app.post('/login', function (req, res) {
	  var username = req.body.username;
	  var password = req.body.password;

	  if (!username) {
	    res.status(422).send({ error: 'Please enter an email address.' });
	  }
	  if (!password) {
	    res.status(422).send({ error: 'Please enter a password.' });
	  }

	  User.findOne({ username: username }, function (err, existingUser) {
	    if (err) return console.log(err);
	    if (existingUser) return console.log('Username in use: ' + existingUser);
	    var newUser = new User({ username: username, password: password });
	    newUser.save(function (err, user) {
	      if (err) {
	        return console.log(err);
	      } else {
	        console.log('New user created: ' + user);
	      }
	    });
	  });
	  res.end();
	});

	app.get('/readUsers', function (req, res) {
	  User.find(function (err, users) {
	    if (err) return console.log(err);
	    console.log('User accounts: ' + users);
	  });
	  res.end();
	});

	app.listen(4321);

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("cheerio");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("mongoose");

/***/ }
/******/ ]);