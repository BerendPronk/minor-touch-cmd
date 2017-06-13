const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra/menus
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/menus`);

  // Object containing system data, after MySQL queries
  let system = {
    menus: []
  };

  req.getConnection((err, connection) => {
    // Fetch all menus from database
    connection.query(`
      SELECT * FROM menus
    `, [], (err, results) => {
      // Push menus in system object
      results.forEach(menu => {
        system.menus.push({
          id: menu.id,
          name: menu.name,
          children: menu.children
        });
      });

      // Checks if a session already exists
      if (req.session.username) {
        res.render('menus/index', {
          username: req.session.username,
          pathname: '/subterra/menus',
          system: {
            menus: system.menus
          }
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

  // Object containing system data, after MySQL queries
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
        res.render('menus/add', {
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
    name: req.body.name.replace(/'/, '"'),
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

  // Object containing system data, after MySQL queries
  let system = {
    pages: []
  };

  req.getConnection((err, connection) => {
    // Select menu with ID from GET parameter
    connection.query(`
      SELECT * FROM menus
      WHERE id = '${ req.params.id }'
    `, [], (err, results) => {
      const menu = results[0];

      // Fetch all system page modules from database
      connection.query(`
        SELECT * FROM pages
      `, [], (err, pages) => {
        pages.forEach(page => {
          system.pages.push(page.title);
        });

        // Checks if a session already exists
        if (req.session.username) {
          res.render('menus/edit', {
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
              children: menu.children.split(',').filter(e => {
                // Removes empty data fields
                return e;
              })
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
    name: req.body.name.replace(/'/, '"'),
    children: req.body.children
  };

  req.getConnection((err, connection) => {
    // Update menu in database
    connection.query(`
      UPDATE menus
      SET name = '${ data.name }', children = '${ data.children }'
      WHERE id = ${ req.params.id }
    `, [], (err, results) => {
      // Navigate to /subterra/menus overview
      res.redirect('/subterra/menus');
    });
  });
});

// [GET] /subterra/menus/delete/:id
router.get('/delete/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/delete/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Retrieve menu name
    connection.query(`
      SELECT * FROM menus
      WHERE id = ${ req.params.id }
    `, [], (err, menus) => {
      const menu = menus[0].name;

      // Remove menu included in pages table (',menu' - 'menu,' - 'menu')
      connection.query(`
        UPDATE pages
        SET menus = REPLACE(REPLACE(REPLACE(menus, ',${ menu }', ''), '${ menu },', ''), '${ menu }', '')
      `, [], (err, pages) => {

        // Remove menu from it's own table in database
        connection.query(`
          DELETE FROM menus
          WHERE id = ${ req.params.id }
          `, [], (err, results) => {
            // Redirect to menu overview page
            res.redirect('/subterra/menus');
          });
      });
    });
  });
});

module.exports = router;
