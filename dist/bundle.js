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
	var fs = __webpack_require__(6);
	var app = express();

	var getCardImages = function getCardImages(url) {
	  return new Promise(function (resolve, reject) {
	    return request(url, function (error, response, body) {
	      if (error) {
	        reject(console.log("Error: " + error));
	      }
	      console.log("Status code: " + response.statusCode);

	      var $ = cheerio.load(body);
	      var imageArray = [];

	      $('div#siteTable > div.link').each(function (index) {
	        //var title = $(this).find('p.title > a.title').text().trim();
	        var image = $(this).find('p.title > a.title').attr('href');
	        if (image.indexOf('imgur') >= 0) {
	          var score = $(this).find('div.score.unvoted').text().trim();
	          var user = $(this).find('a.author').text().trim();

	          /*console.log("Title: " + title);
	          console.log("Score: " + score);
	          console.log("User: " + user);
	          console.log("Image: " + image + '\n');*/
	          imageArray.push(image);
	        }
	      });
	      resolve(imageArray);
	    });
	  });
	};

	//  Routes  //

	app.get('/', function (request, response) {
	  //response.write('Loading');
	  getCardImages("https://www.reddit.com/r/customhearthstone").then(function (result) {
	    console.log("Success - THEN", result[0]);
	    response.set('Content-Type', 'text/html');
	    response.send("<img src='i.imgur.com/NA80Nfc.png'/>");
	    //response.end();
	  });

	  /*.catch( 
	    console.log("Failed")
	  );*/
	});

	app.get('/top', function (req, res) {
	  return getCardImages("https://www.reddit.com/r/customhearthstone/top/?sort=top&t=day");
	});

	app.listen(6587);

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

	module.exports = require("fs");

/***/ }
/******/ ]);