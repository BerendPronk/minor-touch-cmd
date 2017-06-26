const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /portfolio/:item
router.get('/:item', (req, res) => {
  debug(`[${ req.method }] /portfolio/${ req.params.item }`);

  // Convert portfolio item title dashes back to spaces
  const title = req.params.item.replace(/-/g, ' ');

  req.getConnection((err, connection) => {
    // Select portfolio item with title from GET parameter
    connection.query(`
      SELECT * FROM portfolio
      WHERE title = '${ title }'
    `, [], (err, portfolio) => {
      const item = portfolio[0];
      let parent;

      // Retrieve location user came from
      if (req.header('Referer')) {
        parent = req.header('Referer').split('/page/')[1].replace(/-/g, ' ');
      }

      if (item) {
        // Render portfolio item view
        res.render('portfolio', {
          admin: req.session.username,
          tv: req.session.tv,
          pathname: '/portfolio',
          page: {
            id: item.id,
            category: parent,
            title: item.title,
            paragraph: item.paragraph.replace(/\n/g, '<br>'),
            image: item.image,
            video: item.video
          }
        });
      } else {
        // Render error page
        res.render('error', {
          admin: req.session.username,
          tv: req.session.tv,
          pathname: '/error',
          page: {
            category: false
          }
        });
      }
    });
  });
});

module.exports = router;
