const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const CHS = {

  formatCardLinks: (array) => {
    array.forEach( function(thread, index, arr) {
      let img = thread.image;

      if(img.indexOf('i.imgur' === -1 ) && (img.indexOf('imgur') > -1)){
        let code = img.substr(img.lastIndexOf('/'));
        let base = 'http://i.imgur.com';
        let png = '.png';
        if (code.indexOf('png') === -1) {
          arr[index].image = `${base}${code}${png}`;
        }
      }
    });
    return array;
  },
  formatThreadLinks: (array) => {
    array.forEach( function(thread, index, arr) {
      let img = thread.image;
      if (img == undefined) {
        return arr[index].image = "/views/logo.png";
      };
    });
    return array;
  },
  getCards: (subreddit) => {
    return new Promise( (resolve, reject) =>
      request(`https://www.reddit.com/r/${subreddit}`, (error, res, body) => {
        if(error) {
          reject(console.log(`Error: ${error}`));
        }

        const $ = cheerio.load(body);
        const imageArray = [];

        CHS.scrapeCards(imageArray, body);
        
        CHS.formatCardLinks(imageArray);

        resolve(imageArray);
      })
    );
  }, 
  getThreads: (subreddit) => {
    return new Promise( (resolve, reject) =>
      request(`https://www.reddit.com/r/${subreddit}`, (error, res, body) => {
        if(error) {
          reject(console.log(`Error: ${error}`));
        }

        const imageArray = [];

        CHS.scrapeThreads(imageArray, body);

        CHS.formatThreadLinks(imageArray);
        
        resolve(imageArray);
      })
    );
  },
  scrapeCards: (array, body) => {
    const $ = cheerio.load(body);

    $('div#siteTable > div.link:not(.stickied)').each( function( i, index ){
      let image = $(this).attr('data-url');
      if ((image.indexOf('/a/') >= 0)) { return; }
      let score = $(this).find('div.score.unvoted').text().trim();
      let user = $(this).find('a.author').text().trim();
      let title = $(this).find('a.title').text().trim();
      let link = $(this).find('a.comments').attr('href');
      let thread = { image, score, user, title, link };
      array.push(thread);
      return i < 2;
    });
    return array;
  },
  scrapeThreads: (array, body) => {
    const $ = cheerio.load(body);

    $('div#siteTable > div.link:not(.stickied)').each( function( i, index ){
      let image = $(this).find('a.thumbnail img').attr('src');
      let score = $(this).find('div.score.unvoted').text().trim();
      let user = $(this).find('a.author').text().trim();
      let title = $(this).find('a.title').text().trim();
      let link = $(this).find('a.comments').attr('href');
      let thread = { image, score, user, title, link };
      array.push(thread);
      return i < 2;
    });
    return array;
  },
  writeCache: (json) => {
    json[3] = Date.now();
    fs.writeFile('reddit.json', JSON.stringify(json), (err) => {
      err ? console.log('writeCache error.') : console.log('writeCache worked.');
    });
  }
}

module.exports = CHS;