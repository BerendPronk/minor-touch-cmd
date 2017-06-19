const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] index
router.get('/', (req, res) => {
  debug(`[${ req.method }] /index`);

  if (req.session.tv) {
    console.log('You are on a tv')
  }

  req.getConnection((err, connection) => {
    // Select menu with name 'Index' from database
    connection.query(`
      SELECT * FROM menus
      WHERE name = 'Index'
    `, [], (err, menus) => {
      const menu = menus[0].children.split(',');

      res.render('index', {
        tv: req.session.tv,
        menu: menu
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

// [GET] /page/:page
router.get('/page/:page', (req, res) => {
  debug(`[${ req.method }] /${ req.params.page }`);

  const title = req.params.page.replace(/-/g, ' ');

  req.getConnection((err, connection) => {
    // Select page with title from GET parameter
    connection.query(`
      SELECT * FROM pages
      WHERE title = '${ title }'
    `, [], (err, pages) => {
      const page = pages[0];

      // Page menu specific variables
      const pageMenus = page.menus.split(',');
      let menuChildren = [];

      // Fetch all menus from database
      connection.query(`
        SELECT * FROM menus
      `, [], (err, menus) => {

        // Pushes array of each page menu's children
        pageMenus.forEach(pageMenu => {
          menus.forEach(menu => {
            if (menu.name === pageMenu) {
              menuChildren.push(menu.children.split(','));
            }
          });
        });

        // Render page view
        res.render('page', {
          tv: req.session.tv,
          page: {
            type: page.type.replace(/ /g, '-'),
            title: page.title,
            menus: pageMenus.filter(e => {
              // Removes empty data fields
              return e;
            }),
            menuChildren: menuChildren,
            content: page.content
          }
        });
      });
    });
  });
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
        faq: faq
      })
    });
  });
});

// [GET] /404
router.get('/*', (req, res) => {
  res.send('A 404 error occurred.');
});

module.exports = router;
