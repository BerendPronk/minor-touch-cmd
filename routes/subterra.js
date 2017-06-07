const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/login`);

  // Fetch all pages from database
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT * FROM types
    `, [], (err, results) => {
      let types = [];

      results.forEach(type => {
        types.push({
          name: type.name
        });
      });

      // Checks if a session already exists
      if (req.session.username) {
        res.render('subterra/index', {
          username: req.session.username,
          pathname: '/subterra',
          types: types
        });
      } else {
        res.redirect('/subterra/login');
      }
    });
  });
});

// [GET] /subterra/login
router.get('/login', (req, res) => {
  debug(`[${ req.method }] /subterra/login`);

  // Checks if a session already exists
  if (req.session.username) {
    res.redirect('/subterra');
  } else {
    debug('Login requested');
    res.render('subterra/login', {
      username: false,
      pathname: '/login',
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

  // Select user from database based on submitted form
  req.getConnection((err, connection) => {
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?',
      [data.username, data.password], (err, results) => {
      if (results.length > 0) {
        req.session.username = results[0].username;

        debug(`Admin logged in successfully`);

        res.redirect('/subterra');
      } else {
        res.render('subterra/login', {
          username: false,
          pathname: '/subterra',
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

module.exports = router;
