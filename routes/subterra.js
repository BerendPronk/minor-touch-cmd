const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/login`);

  // Checks if a session already exists
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

  // Checks if a session already exists
  if (req.session.username) {
    res.redirect('/subterra');
  } else {
    debug('Login requested');
    res.render('subterra/login', {
      username: false,
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

  // Fetch all pages from database
  req.getConnection((err, connection) => {
    connection.query('SELECT * FROM pages', [], (err, results) => {
      let pages = [];

      results.forEach(page => {
        pages.push({
          id: page.id,
          title: page.title
        });
      });

      res.render('subterra/pages/index', {
        username: req.session.username,
        pages: pages
      });
    });
  });

});

// [GET] /subterra/pages/add
router.get('/pages/add', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/add`);

  // Checks if a session already exists
  if (req.session.username) {

  } else {
    res.redirect('/subterra/login');
  }
});

// [GET] /subterra/pages/edit/:id
router.get('/pages/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/edit/${ req.params.id }`);

  // Select page with ID from GET parameter
  req.getConnection((err, connection) => {
    connection.query('SELECT * FROM pages WHERE id = ?',
    [req.params.id], (err, results) => {
      const page = results[0];
      let system = {
        menus: [],
        types: [],
        modules: []
      };

      // Fetch all system page types from database
      connection.query('SELECT * FROM types', [], (err, types) => {
        types.forEach(type => {
          system.types.push(type.name);
        });

        // Fetch all system page menus from database
        connection.query('SELECT * FROM menus', [], (err, menus) => {
          menus.forEach(menu => {
            system.menus.push(menu.slug);
          });

          // Fetch all system modules from database
          connection.query('SELECT * FROM modules', [], (err, modules) => {
            modules.forEach(type => {
              system.modules.push(module.name);
            });

            // Checks if a session already exists
            if (req.session.username) {
              // Render edit page
              res.render('subterra/pages/edit', {
                username: req.session.username,
                system: {
                  menus: system.menus,
                  types: system.types,
                  modules: system.modules
                },
                page: {
                  id: page.id,
                  title: page.title,
                  type: page.type,
                  parents: page.parents.split(','),
                  content: page.content
                }
              });
            } else {
              res.redirect('/subterra/login');
            }
          });
        });
      });
    });
  });
});

// [POST] /subterra/pages/edit/:id
router.post('/pages/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/edit/${ req.params.id }`);

});

module.exports = router;
