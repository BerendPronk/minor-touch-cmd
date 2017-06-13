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
      // Push pages in system object
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

  // Object containing system data, after MySQL queries
  let system = {
    pages: []
  };

  const data = {
    name: req.body.name.replace(/'/, '"'),
    children: req.body.children
  };

  req.getConnection((err, connection) => {
    // Fetch all menus from database
    connection.query(`
      SELECT * FROM menus
    `, [], (err, menus) => {
      let exists;

      // Check if menu name already exists
      menus.forEach(menu => {
        if (menu.name === data.name) {
          exists = true;
        }
      });

      if (!exists) {
        // Add submitted data to database
        connection.query(`
          INSERT INTO menus SET ?
        `, [data], (err, results) => {
          // Navigate to /subterra/menus overview
          res.redirect('/subterra/menus');
        });
      } else {
        // Fetch all system page modules from database
        connection.query(`
          SELECT * FROM pages
        `, [], (err, pages) => {
          // Push pages in system object
          pages.forEach(page => {
            system.pages.push(page.title);
          });

          res.render('menus/add', {
            username: req.session.username,
            pathname: '/subterra/menus',
            feedback: `Menu name '${ data.name }' already exists.`,
            feedbackState: 'negative',
            system: {
              pages: system.pages
            }
          });
        });
      }
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
        // Push pages in system object
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

  // Object containing system data, after MySQL queries
  let system = {
    pages: []
  };

  const data = {
    name: req.body.name.replace(/'/, '"'),
    children: req.body.children
  };

  req.getConnection((err, connection) => {
    // Fetch all menus from database
    connection.query(`
      SELECT * FROM menus
    `, [], (err, menus) => {
      let exists;

      // Check if menu name already exists
      menus.forEach(menu => {
        if (menu.id !== req.params.id && menu.name === data.name) {
          exists = true;
        }
      });

      if (!exists) {
        // Update menu in database
        connection.query(`
          UPDATE menus
          SET name = '${ data.name }', children = '${ data.children }'
          WHERE id = ${ req.params.id }
        `, [], (err, results) => {
          // Navigate to /subterra/menus overview
          res.redirect('/subterra/menus');
        });
      } else {
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
            // Push pages in system object
            pages.forEach(page => {
              system.pages.push(page.title);
            });

            res.render('menus/edit', {
              username: req.session.username,
              pathname: '/subterra/menus',
              feedback: `Menu name '${ data.name }' already exists.`,
              feedbackState: 'negative',
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
          });
        });
      }
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
