const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra/menus
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/menus`);

  // Fetch all pages from database
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT * FROM menus
    `, [], (err, results) => {
      let menus = [];

      results.forEach(menu => {
        menus.push({
          id: menu.id,
          name: menu.name,
          children: menu.children
        });
      });

      // Checks if a session already exists
      if (req.session.username) {
        res.render('subterra/menus/index', {
          username: req.session.username,
          pathname: '/subterra/menus',
          menus: menus
        });
      } else {
        res.redirect('/subterra/login');
      }
    });
  });
});

// [GET] /subterra/menus/add
router.get('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/add`);

  let system = {
    pages: []
  };

  req.getConnection((err, connection) => {
    // Fetch all system page modules from database
    connection.query(`
      SELECT * FROM pages
    `, [], (err, pages) => {
      pages.forEach(page => {
        system.pages.push(page.title);
      });

      // Checks if a session already exists
      if (req.session.username) {
        res.render('subterra/menus/add', {
          username: req.session.username,
          pathname: '/subterra/menus',
          feedback: false,
          feedbackState: false,
          system: {
            pages: system.pages
          }
        });
      } else {
        res.redirect('/subterra/login');
      }
    });
  });
});

// [POST] /subterra/menus/add
router.post('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/add`);

  const data = {
    name: req.body.name,
    children: req.body.children
  };

  req.getConnection((err, connection) => {
    // Add submitted data to database
    connection.query(`
      INSERT INTO menus SET ?
    `, [data], (err, results) => {
      // Navigate to /subterra/menus overview
      res.redirect('/subterra/menus');
    });
  });
});

// [GET] /subterra/menus/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/edit/${ req.params.id }`);

  // Select page with ID from GET parameter
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT * FROM menus WHERE id = '${ req.params.id }'
    `, [], (err, results) => {
      const menu = results[0];
      let system = {
        pages: []
      };

      // Fetch all system page modules from database
      connection.query(`
        SELECT * FROM pages
      `, [], (err, pages) => {
        pages.forEach(page => {
          system.pages.push(page.title);
        });

        // Checks if a session already exists
        if (req.session.username) {
          res.render('subterra/menus/edit', {
            username: req.session.username,
            pathname: '/subterra/menus',
            feedback: false,
            feedbackState: false,
            system: {
              pages: system.pages
            },
            menu: {
              id: menu.id,
              name: menu.name,
              children: menu.children.split(',')
            }
          });
        } else {
          res.redirect('/subterra/login');
        }
      });
    });
  });
});

// [POST] /subterra/menus/edit/:id
router.post('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/edit/${ req.params.id }`);

  const data = {
    name: req.body.name,
    children: req.body.children
  };

  // Update menu in database
  req.getConnection((err, connection) => {
    connection.query(`
      UPDATE menus
      SET name = '${ data.name }', children = '${ data.children }'
      WHERE id = ${ req.params.id }
    `, [], (err, results) => {
      // Redirect to same page with newly added data
      res.redirect(`/subterra/menus/edit/${ req.params.id }`);
    });
  });
});

module.exports = router;
