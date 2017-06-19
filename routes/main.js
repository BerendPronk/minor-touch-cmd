const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// Define page routing
router.use('/page', require('./page'));

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
