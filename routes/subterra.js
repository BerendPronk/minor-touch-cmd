const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/login`);

  if (req.session.username) {
    res.render('subterra/index', {
      username: req.session.username
    });
  } else {
    res.redirect('/subterra/login');
  }
});

// [GET] /subterra/login
router.get('/login', (req, res) => {
  debug(`[${ req.method }] /subterra/login`);

  if (req.session.username) {
    res.redirect('/subterra');
  } else {
    debug('Login requested');
    res.render('subterra/login', {
      feedback: false,
      feedbackState: false
    });
  }
});

// [POST] /subterra/login
router.post('/login', (req, res) => {
  debug(`[${ req.method }] /subterra/login`);

  const data = {
    username: req.body.username,
    password: req.body.password
  };

  req.getConnection((err, connection) => {
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?',
      [data.username, data.password], (err, results) => {
      if (results.length > 0) {
        req.session.username = results[0].username;

        debug(`Admin logged in successfully`);

        res.redirect('/subterra');
      } else {
        res.render('subterra/login', {
          feedback: 'Wrong username or password given, please try again.',
          feedbackState: 'negative'
        });
      }
    });
  });
});

// [GET] /subterra/logout
router.get('/logout', (req, res) => {
  debug(`[${ req.method }] /subterra/logout`);

  req.session.destroy();

  debug(`Admin logged out successfully`);

  res.redirect('/');
});

// [GET] /subterra/pages
router.get('/pages', (req, res) => {
  debug(`[${ req.method }] /subterra/pages`);

});

// [GET] /subterra/pages/add
router.get('/pages/add', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/add`);

});

module.exports = router;
