const debug = require('debug')('TouchCMD');
const database = require('../../subterra/assets/script/modules/database');
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
    `, [], (err, menus) => {
      // Push menus in system object
      menus.forEach(menu => {
        system.menus.push({
          id: menu.id,
          name: menu.name,
          children: menu.children
        });
      });

      // Check if a session already exists
      if (req.session.username) {
        res.render('menus/index', {
          username: req.session.username,
          pathname: '/subterra/menus',
          feedback: req.query.feedback,
          feedbackState: req.query.state,
          system: {
            menus: system.menus
          }
        });
      } else {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/menus/add
router.get('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/add`);

  req.getConnection((err, connection) => {
    // Fetch all system pages from database
    database.retrieve(connection, {
      category: 'menus',
      tables: ['pages'],
      callback: systemData => {
        // Check if a session already exists
        if (req.session.username) {
          res.render('menus/add', {
            username: req.session.username,
            pathname: '/subterra/menus',
            feedback: req.query.feedback,
            feedbackState: req.query.state,
            system: systemData
          });
        } else {
          // Provide feedback that login session has ended
          res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
        }
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

      // Check if a session already exists
      if (!req.session.username) {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      } else if (!exists) {
        // Add submitted data to database
        connection.query(`
          INSERT INTO menus SET ?
        `, [data], (err, log) => {
          // Navigate to /subterra/menus overview and provide feedback that menu was successfully added
          res.redirect(`/subterra/menus?feedback='${ data.name }' was successfully added.&state=positive`);
        });
      } else {
        // Provide feedback that menu name already exists
        res.redirect(`/subterra/menus/add?feedback=Menu with name '${ data.name }' already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/menus/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/edit/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Select menu with ID from GET parameter
    connection.query(`
      SELECT * FROM menus
      WHERE id = '${ req.params.id }'
    `, [], (err, menus) => {
      const menu = menus[0];

      // Fetch all system pages from database
      database.retrieve(connection, {
        category: 'menus',
        tables: ['pages'],
        callback: systemData => {
          // Check if a session already exists
          if (req.session.username) {
            res.render('menus/edit', {
              username: req.session.username,
              pathname: '/subterra/menus',
              feedback: req.query.feedback,
              feedbackState: req.query.state,
              system: systemData,
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
            // Provide feedback that login session has ended
            res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
          }
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
    // Fetch all menus from database
    connection.query(`
      SELECT * FROM menus
    `, [], (err, menus) => {
      let exists;

      // Check if menu name already exists
      menus.forEach(menu => {
        if (menu.id != req.params.id && menu.name === data.name) {
          exists = true;
        }
      });

      // Check if a session already exists
      if (!req.session.username) {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      } else if (!exists) {
        // Update menu in database
        connection.query(`
          UPDATE menus
          SET name = '${ data.name }', children = '${ data.children }'
          WHERE id = ${ req.params.id }
        `, [], (err, log) => {
          // Navigate to /subterra/menus overview and provide feedback that menu was successfully edited
          res.redirect(`/subterra/menus?feedback='${ data.name }' was successfully edited.&state=positive`);
        });
      } else {
        // Provide feedback that menu name already exists
        res.redirect(`/subterra/menus/edit/${ req.params.id }?feedback=Menu with name '${ data.name }' already exists.&state=negative`);
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
          `, [], (err, log) => {
            // Redirect to menu overview page and provide feedback that menu is successfully deleted
            res.redirect(`/subterra/menus?feedback=Successfully deleted the menu.&state=positive`);
          });
      });
    });
  });
});

module.exports = router;
