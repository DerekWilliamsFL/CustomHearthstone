const request = require('request');
const cheerio = require('cheerio');

const CHS = {
  checkUser: function loggedIn(req, res, next) {
    if (req.user !== undefined) {
      next();
    } else {
      res.json('You are not logged in');
    }
  },
  getCards: (url) => {
    return new Promise( (resolve, reject) =>
      request(url, (error, res, body) => {
        if(error) {
          reject(console.log(`Error: ${error}`));
        }

        const $ = cheerio.load(body);
        const imageArray = [];

        
        $('div#siteTable > div.link:not(.stickied)').each( function( i, index ){
          let image = $(this).attr('data-url');
          let score = $(this).find('div.score.unvoted').text().trim();
          let user = $(this).find('a.author').text().trim();
          let title = $(this).find('p.title').text().trim();
          let link = $(this).find('a.comments').attr('href');
          let thread = { image, score, user, title, link };
          imageArray.push(thread);
          return i < 5;
        });
        
        imageArray.forEach( function(thread, index, arr) {
          let img = thread.image;
          if ((img.indexOf('/a/') >= 0) || (img.indexOf('comments') >= 0)) {
            return arr.splice(index, 1);
          };

          if(img.indexOf('i.imgur' === -1 ) && (img.indexOf('imgur') > -1)){
            let code = img.substr(img.lastIndexOf('/'));
            let base = 'http://i.imgur.com';
            let png = '.png';
            if (code.indexOf('png') === -1) {
              arr[index].image = `${base}${code}${png}`;
            }
          }
        });
        resolve(imageArray);
      })
    );
  }, 
  getThreads: (url) => {
    return new Promise( (resolve, reject) =>
      request(url, (error, res, body) => {
        if(error) {
          reject(console.log(`Error: ${error}`));
        }

        const $ = cheerio.load(body);
        const imageArray = [];

        
        $('div#siteTable > div.link:not(.stickied)').each( function( i, index ){
          let image = $(this).find('a.thumbnail img').attr('src');
          let score = $(this).find('div.score.unvoted').text().trim();
          let user = $(this).find('a.author').text().trim();
          let title = $(this).find('p.title').text().trim();
          let link = $(this).find('a.comments').attr('href');
          let thread = { image, score, user, title, link };
          imageArray.push(thread);
          return i < 2;
        });
        
        imageArray.forEach( function(thread, index, arr) {
          let img = thread.image;
          if (img == undefined) {
            return arr[index].image = "/views/logo.png";
          };
        });
        resolve(imageArray);
      })
    );
}
}

module.exports = CHS;