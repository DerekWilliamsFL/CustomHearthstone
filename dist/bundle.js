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
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	console.log('hello');

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var request = __webpack_require__(3);
	var cheerio = __webpack_require__(4);
	var express = __webpack_require__(5);
	var path = __webpack_require__(6);
	var fs = __webpack_require__(7);
	var app = express();

	var getCardImages = function getCardImages(url) {
	  console.log('Running GCI');
	  return new Promise(function (resolve, reject) {
	    return request(url, function (error, response, body) {
	      if (error) {
	        reject(console.log("Error: " + error));
	      }
	      console.log("Status code: " + response.statusCode);

	      var $ = cheerio.load(body);
	      var imageArray = [];

	      $('div#siteTable > div.link').each(function (index) {
	        var image = $(this).find('p.title > a.title').attr('href');
	        var redditImage = $(this).find('div.res-expando-box > a.res-expando-link').attr('href');
	        var title = $(this).find('p.title').text().trim();
	        var score = $(this).find('div.score.unvoted').text().trim();
	        var user = $(this).find('a.author').text().trim();
	        var object = { image: image, redditImage: redditImage, title: title, score: score, user: user };
	        imageArray.push(object);
	      });
	      console.log(imageArray);
	      imageArray.forEach(function (object, index, arr) {
	        var img = object.image;
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

	//app.use(express.static('views'));

	//  Routes  //

	app.get('/', function (request, response) {
	  getCardImages("https://www.reddit.com/r/customhearthstone").then(function (result) {
	    console.log("Success - THEN", result);
	    response.set('Content-Type', 'text/html');
	    result.forEach(function (val) {
	      return response.write("<img width='150' alt='" + val.title + "' src='" + val.image + "'/>");
	    });
	    response.write("<img width='150' src='https://i.redd.it/tfsak3ixxdyx.png' />");
	    response.send();
	  }).then(function () {
	    console.log('Derek');
	    //response.render('./views/index.html');
	  });
	});

	app.get('/top', function (req, res) {
	  //res.render('/views/index.html');
	  getCardImages("https://www.reddit.com/r/customhearthstone/top/?sort=top&t=day");
	});

	app.listen(4321);

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("cheerio");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ }
/******/ ]);