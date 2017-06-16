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

module.exports = router;
