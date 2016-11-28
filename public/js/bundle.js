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
	module.exports = __webpack_require__(5);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var express = __webpack_require__(2);
	var path = __webpack_require__(3);
	var fs = __webpack_require__(4);
	var app = express();
	module.exports = function (app) {

	  app.get('/', function (req, res) {
	    console.log('routes working');
	    res.sendFile(process.cwd() + '/public/views/index.html');
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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var request = __webpack_require__(6);
	var cheerio = __webpack_require__(7);
	var express = __webpack_require__(2);
	var bodyParser = __webpack_require__(8);
	var path = __webpack_require__(3);
	var fs = __webpack_require__(4);
	//const snoowrap = require('./credentials');
	//const reddit = snoowrap.reddit;
	var mongoose = __webpack_require__(9);

	mongoose.connect('mongodb://localhost/test', function (err) {
	  if (!err) {
	    console.log('Connected');
	  };
	});

	var app = express();
	__webpack_require__(1)(app);
	__webpack_require__(10);

	app.use(bodyParser.json());
	app.use(express.static(process.cwd() + '/public'));

	var getCardImages = function getCardImages(url) {
	  console.log('Running GCI');
	  return new Promise(function (resolve, reject) {
	    return request(url, function (error, res, body) {
	      if (error) {
	        reject(console.log("Error: " + error));
	      } else {
	        console.log('No Error');
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

	        if (img.indexOf('/a/') >= 0) {
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

	app.get('/login', function (req, res) {

	  res.end();
	});

	app.listen(4321);

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("cheerio");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("mongoose");

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mongoose = __webpack_require__(9);
	var crypto = __webpack_require__(11);

	var UserSchema = new mongoose.Schema({
	  username: { type: String, lowercase: true, required: true, unique: true },
	  hash: String,
	  salt: String,
	  favorites: []
	});

	mongoose.model('User', UserSchema);

	UserSchema.methods.setPassword = function (password) {
	  undefined.salt = crypto.randomBytes(16).toString('hex');

	  undefined.hash = crypto.pbkdf2Sync(password, undefined.salt, 1000, 64).toString('hex');
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ }
/******/ ]);