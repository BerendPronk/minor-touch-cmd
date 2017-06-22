const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// Define page routing
router.use('/page', require('./page'));

// [GET] index
router.get('/', (req, res) => {
  debug(`[${ req.method }] /index`);

  req.getConnection((err, connection) => {
    // Select menu with name 'Index' from database
    connection.query(`
      SELECT * FROM menus
      WHERE name = 'Index'
    `, [], (err, menus) => {
      const menu = menus[0].children.split(',');

      // Fetch intro paragraphs for main menu
      connection.query(`
        SELECT * FROM pages
        WHERE (title LIKE '%${ menu[0] }%' OR title LIKE '%${ menu[1] }%' OR title LIKE '%${ menu[2] }%')
      `, [], (err, pages) => {
        let introText = [];

        // Extract intro from each category page
        pages.forEach(page => {
          const content = page.content.split('|-|');

          // Select the first occuring paragraph in page content
          for (let block of content) {
            if (block.charAt(1) === 'P') {
              introText.push(block.replace('|P|', ''));
              break;
            }
          }
        });

        // Render index page
        res.render('index', {
          tv: req.session.tv,
          parent: false,
          menu: menu,
          introText: introText
        });
      });
    });
  });
});

// [GET] /tv
router.get('/tv', (req, res) => {
  debug(`[${ req.method }] /tv - Multi-touch screen mode active`);

  // Activate session when user entered URL
  req.session.tv = true;

  // Redirect back to the index pages
  res.redirect('/');
});

// [GET] /faq
router.get('/faq', (req, res) => {
  debug(`[${ req.method }] /faq`);

  req.getConnection((err, connection) => {
    // Fetch all FAQ questions from database
    connection.query(`
      SELECT * FROM faq
    `, [], (err, faq) => {

      // Render FAQ view
      res.render('faq', {
        tv: req.session.tv,
        parent: false,
        faq: faq
      })
    });
  });
});

// [GET] /404
router.get('/:notfound', (req, res) => {
  debug(`[${ req.method }] /${ req.params.notfound } - which does not exist on server`);

  // Render error page
  res.render('error', {
    tv: req.session.tv,
    parent: false
  });
});

module.exports = router;
