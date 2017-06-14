const debug = require('debug')('TouchCMD');
const database = require('../../subterra/assets/script/modules/database');
const express = require('express');
const router = express.Router();

// [GET] /subterra/types
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/types`);

  // Object containing system data, after MySQL queries
  let system = {
    types: []
  };

  req.getConnection((err, connection) => {
    // Fetch all types from database
    connection.query(`
      SELECT * FROM types
    `, [], (err, types) => {
      // Push types in system object
      types.forEach(type => {
        system.types.push({
          id: type.id,
          name: type.name,
          modules: type.defaultModules
        });
      });

      // Checks if a session already exists
      if (req.session.username) {
        res.render('types/index', {
          username: req.session.username,
          pathname: '/subterra/types',
          system: {
            types: system.types
          }
        });
      } else {
        res.redirect('/subterra/login');
      }
    });
  });
});

// [GET] /subterra/types/add
router.get('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/types/add`);

  req.getConnection((err, connection) => {
    // Fetch all system page modules from database
    database.retrieve(connection, {
      category: 'types',
      tables: ['modules'],
      callback: systemData => {
        // Checks if a session already exists
        if (req.session.username) {
          res.render('types/add', {
            username: req.session.username,
            pathname: '/subterra/types',
            feedback: false,
            feedbackState: false,
            system: systemData
          });
        } else {
          res.redirect('/subterra/login');
        }
      }
    });
  });
});

// [POST] /subterra/types/add
router.post('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/types/add`);

  const data = {
    name: req.body.name.replace(/'/, '"'),
    defaultModules: req.body.modules
  };

  req.getConnection((err, connection) => {
    // Fetch all page types from database
    connection.query(`
      SELECT * FROM types
    `, [], (err, types) => {
      let exists;

      // Check if type name already exists
      types.forEach(type => {
        if (type.name === data.name) {
          exists = true;
        }
      });

      if (!exists) {
        // Add submitted data to database
        connection.query(`
          INSERT INTO types SET ?
        `, [data], (err, results) => {
          // Navigate to /subterra/types overview
          res.redirect('/subterra/types');
        });
      } else {
        // Fetch all system page modules from database
        database.retrieve(connection, {
          category: 'types',
          tables: ['modules'],
          callback: systemData => {
            res.render('types/add', {
              username: req.session.username,
              pathname: '/subterra/types',
              feedback: `Page type with name '${ data.name }' already exists.`,
              feedbackState: 'negative',
              system: systemData
            });
          }
        });
      }
    });
  });
});

// [GET] /subterra/types/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/types/edit/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Select type with ID from GET parameter
    connection.query(`
      SELECT * FROM types
      WHERE id = '${ req.params.id }'
    `, [], (err, types) => {
      const type = types[0];

      // Fetch all system page modules from database
      database.retrieve(connection, {
        category: 'types',
        tables: ['modules'],
        callback: systemData => {
          // Checks if a session already exists
          if (req.session.username) {
            res.render('types/edit', {
              username: req.session.username,
              pathname: '/subterra/types',
              feedback: false,
              feedbackState: false,
              system: systemData,
              type: {
                id: type.id,
                name: type.name,
                modules: type.defaultModules.split(',').filter(e => {
                  // Removes empty data fields
                  return e;
                })
              }
            });
          } else {
            res.redirect('/subterra/login');
          }
        }
      });
    });
  });
});

// [POST] /subterra/types/edit/:id
router.post('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/types/edit/${ req.params.id }`);

  const data = {
    name: req.body.name.replace(/'/, '"'),
    modules: req.body.modules
  };

  req.getConnection((err, connection) => {
    // Fetch all menus from database
    connection.query(`
      SELECT * FROM types
    `, [], (err, types) => {
      let exists;

      // Check if type name already exists
      types.forEach(type => {
        if (type.id != req.params.id && type.name === data.name) {
          exists = true;
        }
      });

      if (!exists) {
        // Update type in database
        connection.query(`
          UPDATE types
          SET name = '${ data.name }', defaultModules = '${ data.modules }'
          WHERE id = ${ req.params.id }
        `, [], (err, results) => {
          // Navigate to /subterra/types overview
          res.redirect('/subterra/types');
        });
      } else {
        // Select type with ID from GET parameter
        connection.query(`
          SELECT * FROM types
          WHERE id = '${ req.params.id }'
        `, [], (err, types) => {
          const type = types[0];

          // Fetch all system page modules from database
          database.retrieve(connection, {
            category: 'types',
            tables: ['modules'],
            callback: systemData => {
              res.render('types/edit', {
                username: req.session.username,
                pathname: '/subterra/types',
                feedback: `Page type with name '${ data.name }' already exists.`,
                feedbackState: 'negative',
                system: systemData,
                type: {
                  id: type.id,
                  name: type.name,
                  modules: type.defaultModules.split(',').filter(e => {
                    // Removes empty data fields
                    return e;
                  })
                }
              });
            }
          });
        });
      }
    });
  });
});

// [GET] /subterra/types/delete/:id
router.get('/delete/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/types/delete/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Remove page from database
    connection.query(`
      DELETE FROM types
      WHERE id = ${ req.params.id }
    `, [], (err, results) => {
      // Redirect to type overview page
      res.redirect('/subterra/types');
    });
  });
});

module.exports = router;
