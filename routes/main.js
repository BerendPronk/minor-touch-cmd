const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /
router.get('/', (req, res) => {
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT * FROM pages
    `, [], (err, results) => {
      let menu = [];

      results.forEach(page => {
        if (page.type === 'year') {
          menu.push(page.title);
        }
      });

      res.render('index', {
        menu: menu
      });
    });
  });
});

module.exports = router;
