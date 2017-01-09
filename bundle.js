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
	module.exports = __webpack_require__(12);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var express = __webpack_require__(2);
	var path = __webpack_require__(3);
	var fs = __webpack_require__(4);
	var passport = __webpack_require__(5);
	var LocalStrategy = __webpack_require__(6).Strategy;
	var CHS = __webpack_require__(7);
	var cacheJson = fs.readFileSync('./reddit.json', 'utf-8');
	var cacheTime = JSON.parse(cacheJson)[3];
	var User = __webpack_require__(10);

	var app = express();
	module.exports = function (app) {

	  app.get('/', function (req, res) {
	    var username = void 0;
	    req.user ? username = req.user.username : username = undefined;
	    var oneHourCache = cacheTime + 1000 * 60 * 60 > Date.now();
	    if (oneHourCache) {
	      var cache = JSON.parse(cacheJson);
	      var threads = cache[0].concat(cache[1]);
	      var cards = cache[2];

	      /* Template */res.render('index', { threads: threads, hotCards: cards, username: username });
	      // React = res.json({"data": data, "username": username}); 
	    } else {
	      Promise.all([CHS.getThreads("hearthstone"), CHS.getThreads("competitivehearthstone"), CHS.getCards("customhearthstone")]).then(function (results) {
	        var threads = results[0].concat(results[1]);
	        var cards = results[2];
	        CHS.writeCache(results);
	        /* Template */res.render('index', { threads: threads, hotCards: cards, username: username });
	        // React = res.json({"data": data, "username": username}); 
	      }).catch(function (error) {
	        console.log('Error occured on /.');
	        res.end();
	      });
	    }
	  });

	  app.get('/cards', function (req, res) {
	    CHS.getCards("customhearthstone").then(function (result) {
	      res.json(result);
	      res.end();
	    }).catch(function (error) {
	      return console.log('Error occured on /cards.');
	    });
	  });

	  app.get('/likes', CHS.checkUser, function (req, res) {
	    res.json(req.user.likedCards);
	    res.end();
	  });

	  app.post('/likes', CHS.checkUser, function (req, res) {
	    req.user.likedCards.push(req.body);
	    req.user.save(function (err, user) {
	      err ? console.log(err) : console.log(req.user.likedCards);
	    });
	    res.end();
	  });

	  app.get('/dislikes', CHS.checkUser, function (req, res) {
	    res.json(req.user.dislikedCards);
	    res.end();
	  });

	  app.post('/dislikes', CHS.checkUser, function (req, res) {
	    req.user.dislikedCards.push(req.body);
	    req.user.save(function (err, user) {
	      err ? console.log(err) : console.log(req.user.dislikedCards);
	    });
	    res.end();
	  });

	  app.post('/category', function (req, res) {
	    CHS.getCards(req.body.url).then(function (result) {
	      res.json(result);
	      res.end();
	    }).catch(function (error) {
	      return console.log('Error occured on /category.');
	    });
	  });

	  app.post('/login', passport.authenticate('local', {
	    successRedirect: '/',
	    failureFlash: true
	  }));

	  app.get('/readUsers', function (req, res) {
	    User.find(function (err, users) {
	      err ? console.log(err) : console.log('User accounts: ' + users);
	    });
	    res.end();
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
	var fs = __webpack_require__(4);

	var CHS = {
	  checkUser: function loggedIn(req, res, next) {
	    if (req.user !== undefined) {
	      next();
	    } else {
	      res.json('You are not logged in');
	    }
	  },
	  formatCardLinks: function formatCardLinks(array) {
	    array.forEach(function (thread, index, arr) {
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
	    return array;
	  },
	  formatThreadLinks: function formatThreadLinks(array) {
	    array.forEach(function (thread, index, arr) {
	      var img = thread.image;
	      if (img == undefined) {
	        return arr[index].image = "/views/logo.png";
	      };
	    });
	    return array;
	  },
	  getCards: function getCards(subreddit) {
	    return new Promise(function (resolve, reject) {
	      return request('https://www.reddit.com/r/' + subreddit, function (error, res, body) {
	        if (error) {
	          reject(console.log('Error: ' + error));
	        }

	        var $ = cheerio.load(body);
	        var imageArray = [];

	        CHS.scrapeCards(imageArray, body);

	        CHS.formatCardLinks(imageArray);

	        resolve(imageArray);
	      });
	    });
	  },
	  getThreads: function getThreads(subreddit) {
	    return new Promise(function (resolve, reject) {
	      return request('https://www.reddit.com/r/' + subreddit, function (error, res, body) {
	        if (error) {
	          reject(console.log('Error: ' + error));
	        }

	        var imageArray = [];

	        CHS.scrapeThreads(imageArray, body);

	        CHS.formatThreadLinks(imageArray);

	        resolve(imageArray);
	      });
	    });
	  },
	  scrapeCards: function scrapeCards(array, body) {
	    var $ = cheerio.load(body);

	    $('div#siteTable > div.link:not(.stickied)').each(function (i, index) {
	      var image = $(this).attr('data-url');
	      var score = $(this).find('div.score.unvoted').text().trim();
	      var user = $(this).find('a.author').text().trim();
	      var title = $(this).find('p.title').text().trim();
	      var link = $(this).find('a.comments').attr('href');
	      var thread = { image: image, score: score, user: user, title: title, link: link };
	      array.push(thread);
	      return i < 3;
	    });
	    return array;
	  },
	  scrapeThreads: function scrapeThreads(array, body) {
	    var $ = cheerio.load(body);

	    $('div#siteTable > div.link:not(.stickied)').each(function (i, index) {
	      var image = $(this).find('a.thumbnail img').attr('src');
	      var score = $(this).find('div.score.unvoted').text().trim();
	      var user = $(this).find('a.author').text().trim();
	      var title = $(this).find('p.title').text().trim();
	      var link = $(this).find('a.comments').attr('href');
	      var thread = { image: image, score: score, user: user, title: title, link: link };
	      array.push(thread);
	      return i < 2;
	    });
	    return array;
	  },
	  writeCache: function writeCache(json) {
	    json[3] = Date.now();
	    fs.writeFile('reddit.json', JSON.stringify(json), function (err) {
	      err ? console.log('writeCache error.') : console.log('writeCache worked.');
	    });
	  }
	};

	module.exports = CHS;

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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mongoose = __webpack_require__(11);
	var Schema = mongoose.Schema;

	var UserSchema = new mongoose.Schema({
	  username: { type: String, lowercase: true, required: true, unique: true },
	  password: { type: String, lowercase: true, required: true, unique: true },
	  likedCards: [{
	    link: String,
	    image: String,
	    title: String,
	    score: String
	  }],
	  dislikedCards: [{
	    link: String,
	    image: String,
	    title: String,
	    score: String
	  }]
	});

	var User = mongoose.model('User', UserSchema);

	module.exports = User;

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("mongoose");

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var express = __webpack_require__(2);
	var bodyParser = __webpack_require__(13);
	var path = __webpack_require__(3);
	var fs = __webpack_require__(4);
	var mongoose = __webpack_require__(11);
	var Schema = mongoose.Schema;
	var passport = __webpack_require__(5);
	var LocalStrategy = __webpack_require__(6).Strategy;
	var session = __webpack_require__(14);
	var pug = __webpack_require__(15);
	var User = __webpack_require__(10);

	mongoose.Promise = global.Promise;
	mongoose.connect('mongodb://localhost/test', function (err) {
	  err ? console.log('Error connecting to Mongo.') : console.log('Connected.');
	});

	var app = express();

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

	passport.serializeUser(function (user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
	  User.findById(id, function (err, user) {
	    done(err, user);
	  });
	});

	passport.use(new LocalStrategy(function (username, password, done) {
	  User.findOne({ username: username }, function (err, existingUser) {
	    if (err) {
	      return done(err);
	    };
	    if (existingUser) {
	      return done(null, existingUser);
	    };
	    var newUser = new User({ username: username, password: password, likedCards: [], dislikedCards: [] });
	    newUser.save(function (err, user) {
	      if (err) {
	        return done(err);
	      } else {
	        console.log('New user created: ' + user);
	      }
	      return done(err);
	    });
	  });
	}));

	app.use(express.static(path.join(__dirname, '/public')));
	app.set('view engine', 'pug');
	app.set('views', path.join(__dirname, '/public/views'));
	__webpack_require__(1)(app);

	app.listen(4321);

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = require("express-session");

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = require("pug");

/***/ }
/******/ ]);