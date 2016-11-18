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
	__webpack_require__(5);
	module.exports = __webpack_require__(6);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';

	var express = __webpack_require__(2);
	var path = __webpack_require__(3);
	var fs = __webpack_require__(4);
	var app = express();

	app.use(express.static(__dirname + '/public'));

	module.exports = function (app) {
	  //  Routes  //


	  app.get('/', function (req, res) {
	    console.log('routes working');
	    res.sendFile(process.cwd() + '/public/views/index.html');
	  });
	};
	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

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

	'use strict';

	console.log('hello');

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var request = __webpack_require__(7);
	var cheerio = __webpack_require__(8);
	var express = __webpack_require__(2);
	var path = __webpack_require__(3);
	var fs = __webpack_require__(4);
	var app = express();
	__webpack_require__(1)(app);

	var getCardImages = function getCardImages(url) {
	  console.log('Running GCI');
	  return new Promise(function (resolve, reject) {
	    return request(url, function (error, res, body) {
	      if (error) {
	        reject(console.log("Error: " + error));
	      }
	      console.log("Status code: " + res.statusCode);

	      var $ = cheerio.load(body);
	      var imageArray = [];

	      $('div#siteTable > div.link').each(function (index) {
	        var image = $(this).attr('data-url');
	        var title = $(this).find('p.title').text().trim();
	        var score = $(this).find('div.score.unvoted').text().trim();
	        var user = $(this).find('a.author').text().trim();
	        var thread = { image: image, title: title, score: score, user: user };
	        imageArray.push(thread);
	      });
	      console.log(imageArray);
	      imageArray.forEach(function (thread, index, arr) {
	        var img = thread.image;
	        if (img.indexOf('/a/') >= 0) {
	          console.log(arr[index]);
	          arr.splice(index, 1);
	          return;
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
	    console.log("Success - THEN", result);
	    res.set('Content-Type', 'text/html');
	    result.forEach(function (val) {
	      return res.write("<img width='150' alt='" + val.title + "' src='" + val.image + "'/>");
	    });
	    res.write("<img width='150' src='https://i.redd.it/tfsak3ixxdyx.png' />");
	    res.end();
	  });
	});

	app.get('/top', function (req, res) {
	  getCardImages("https://www.reddit.com/r/customhearthstone/top/?sort=top&t=day");
	  res.end();
	});

	app.listen(4321);

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("cheerio");

/***/ }
/******/ ]);