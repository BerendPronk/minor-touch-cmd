const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

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

      res.render('index', {
        tv: req.session.tv,
        menu: menu
      });
    });
  });
});

module.exports = router;
