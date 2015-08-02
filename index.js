(function() {
  var request = require('request');
  var cheerio = require('cheerio');
  var mkdirp = require('mkdirp');
  var toMarkdown = require('to-markdown');
  var fs = require('fs');
  var args = require('minimist')(process.argv.slice(2));
  var host = 'http://www.protagonize.com';

  if (args._.length === 0) {
    console.log('you must specify a username');
    process.exit(1);
  }

  var username = args._[0];

  function processPage(url) {
    request(url, function(error, response, body) {
      if (error) {
        console.log('could not retrieve page: ' + error);
        process.exit(1);
      }

      var $ = cheerio.load(body);
      var page = $('#primaryContent');
      var title = page.find('article header h1 span').eq(0).text();
      var content = page.find('#pageBody').html();
      var tags = $('#workGoods .tags-list a').map(function(i, el) {
        return $(this).text();
      }).get();
      var cats = $('#workGoods .work-categories a').map(function(i, el) {
        return $(this).text();
      }).get();
      var pubDate = $('#workByline .byline-content-body time').attr('datetime');
      var story = $('#workGoods .work-details a[title^="View this"][itemprop="url"]').text();
      var path = url.replace(host + '/', '');

      console.log('Processing page: ' + path + ' title: ' + title);

      // Create folder structure
      mkdirp.sync([username, path].join('/'));

      // create metadata file
      fs.writeFile([username, path, 'metadata.json'].join('/'), JSON.stringify({
        title: title,
        tags: tags,
        story: story,
        categories: cats,
        published: pubDate,
      }), function(err) {
        if (err) {
          console.log('failed to write metadata: ' + err);
          process.exit(1);
        }
      });

      // create markdown file
      fs.writeFile([username, path, 'content.md'].join('/'), toMarkdown(content), function(err) {
        if (err) {
          console.log('failed to write content: ' + err);
          process.exit(1);
        }
      });
    });
  }

  function getWorks(url) {
    request(url, function(error, response, body) {
      if (error) {
        console.log('could not retrieve works page: ' + error);
        process.exit(1);
      }

      var $ = cheerio.load(body);
      var pages = $('#browseListing .story h4 a');

      pages.each(function(_, page) {
        processPage(host + $(page).attr('href'));
      });

      var nextPage = $('#browseListing .pager-bottom a.page.next');
      if (nextPage.length === 1) {
        var nextURL = $(nextPage).attr('href');
        if (nextURL) {
          console.log('Processing works on: ' + nextURL);
          getWorks(host + nextURL);
        } else {
          console.log('No more pages to process');
        }
      }
    });
  }

  getWorks(host + '/author/' + username + '/works');
})();
