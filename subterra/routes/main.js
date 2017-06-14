const debug = require('debug')('TouchCMD');
const path = require('path');
const multer = require('multer');
const express = require('express');
const router = express.Router();

// Initialize multer storage
const storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, path.dirname(require.main.filename) + '/media');
  },
  filename: function (req, file, callBack) {
    callBack(null, file.originalname);
  }
});

// Apply initialized storage to multer
const upload = multer({
  storage: storage
});

// Declare subterra routing
router.use('/menus', require('./menus'));
router.use('/types', require('./types'));
router.use('/pages', upload.any(), require('./pages'));
router.use('/portfolio', upload.any(), require('./portfolio'));

// [GET] /subterra
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra`);

  // Object containing system data, after MySQL queries
  let system = {
    types: []
  };

  req.getConnection((err, connection) => {
    // Fetch all pages from database
    connection.query(`
      SELECT * FROM types
    `, [], (err, types) => {
      // Push types in system object
      types.forEach(type => {
        system.types.push(type.name);
      });

      // Check if a session already exists
      if (req.session.username) {
        res.render('dashboard', {
          username: req.session.username,
          pathname: '/subterra',
          feedback: req.query.feedback,
          feedbackState: req.query.state,
          system: {
            types: system.types
          }
        });
      } else {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/login
router.get('/login', (req, res) => {
  debug(`[${ req.method }] /subterra/login`);

  // Check if a session already exists
  if (req.session.username) {
    // Navigate to subterra dashboard
    res.redirect(`/subterra'`);
  } else {
    res.render('login', {
      username: false,
      pathname: '/login',
      feedback: req.query.feedback,
      feedbackState: req.query.state,
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
    // Select user from database based on submitted form
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?',
      [data.username, data.password], (err, results) => {
      if (results.length > 0) {
        req.session.username = results[0].username;

        // Navigate to subterra dashboard and provide feedback with username
        res.redirect(`/subterra?feedback=Welcome back ${ req.session.username }!&state=positive`);
      } else {
        // Provide feedback that wrong data has been entered
        res.redirect(`/subterra/login?feedback=Wrong username or password given, please try again.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/logout
router.get('/logout', (req, res) => {
  debug(`[${ req.method }] /subterra/logout`);

  req.session.destroy();

  res.redirect('/');
});

// [GET] /subterra/search/?query
router.get('/search/*', (req, res) => {
  debug(`[${ req.method }] /subterra/search`);

  const query = req.query.query;
  const queryString = () => {
    if (req.query.query === '') {
      return 'All';
    } else {
      return req.query.query;
    }
  };

  // Object containing system data, after MySQL queries
  let system = {
    types: [],
    menus: [],
    pages: [],
    portfolio: []
  };

  req.getConnection((err, connection) => {
    // Fetch all system types from database that contain query
    connection.query(`
      SELECT * FROM types
      WHERE name LIKE '%${ query }%'
    `, [], (err, types) => {
      // Push types in system object
      types.forEach(type => {
        system.types.push({
          id: type.id,
          name: type.name
        });
      });

      // Fetch all system menus from database that contain query
      connection.query(`
        SELECT * FROM menus
        WHERE name LIKE '%${ query }%'
      `, [], (err, menus) => {
        // Push menus in system object
        menus.forEach(menu => {
          system.menus.push({
            id: menu.id,
            name: menu.name
          });
        });

        // Fetch all system pages from database that contain query
        connection.query(`
          SELECT * FROM pages
          WHERE title LIKE '%${ query }%'
        `, [], (err, pages) => {
          // Push pages in system object
          pages.forEach(page => {
            system.pages.push({
              id: page.id,
              name: page.title
            });
          });

          // Fetch all system portolio items from database that contain query
          connection.query(`
            SELECT * FROM portfolio
            WHERE title LIKE '%${ query }%'
          `, [], (err, portfolio) => {
            // Push portfolio items in system object
            portfolio.forEach(item => {
              system.portfolio.push({
                id: item.id,
                name: item.title
              });
            });

            // Check if a session already exists
            if (req.session.username) {
              res.render('search', {
                username: req.session.username,
                pathname: '/search',
                feedback: req.query.feedback,
                feedbackState: req.query.state,
                query: queryString(),
                system: {
                  types: system.types,
                  menus: system.menus,
                  pages: system.pages,
                  portfolio: system.portfolio
                }
              });
            } else {
              // Provide feedback that login session has ended
              res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
            }
          });
        });
      });
    });
  });
});

module.exports = router;
