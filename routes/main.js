const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// Define page routing
router.use('/page', require('./page'));
router.use('/portfolio', require('./portfolio'));

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
      let query = '';

      // Add child to query string
      menu.forEach(child => {
        query += ` OR title LIKE '%${ child }%'`;
      });

      // Fetch intro paragraphs for main menu
      connection.query(`
        SELECT * FROM pages
        WHERE (${ query.replace(' OR ', '') })
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
          admin: req.session.username,
          tv: req.session.tv,
          pathname: '/',
          page: {
            category: false
          },
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
        admin: req.session.username,
        tv: req.session.tv,
        pathname: '/faq',
        page: {
          category: false
        },
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
    admin: req.session.username,
    tv: req.session.tv,
    pathname: '/error',
    page: {
      category: false
    }
  });
});

module.exports = router;
