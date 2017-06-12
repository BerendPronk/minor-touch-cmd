const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra/types
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/types`);

  // Object containing system data, after MySQL queries
  let system = {
    types: []
  };

  // Fetch all types from database
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT * FROM types
    `, [], (err, results) => {
      // Push types in system object
      results.forEach(type => {
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

  // Object containing system data, after MySQL queries
  let system = {
    modules: []
  };

  req.getConnection((err, connection) => {
    // Fetch all system page modules from database
    connection.query(`
      SELECT * FROM modules
    `, [], (err, modules) => {
      modules.forEach(module => {
        system.modules.push(module.name);
      });

      // Checks if a session already exists
      if (req.session.username) {
        res.render('types/add', {
          username: req.session.username,
          pathname: '/subterra/types',
          feedback: false,
          feedbackState: false,
          system: {
            modules: system.modules
          }
        });
      } else {
        res.redirect('/subterra/login');
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
    // Add submitted data to database
    connection.query(`
      INSERT INTO types SET ?
    `, [data], (err, results) => {
      // Navigate to /subterra/types overview
      res.redirect('/subterra/types');
    });
  });
});

// [GET] /subterra/types/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/types/edit/${ req.params.id }`);

  // Object containing system data, after MySQL queries
  let system = {
    modules: []
  };

  // Select page with ID from GET parameter
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT * FROM types WHERE id = '${ req.params.id }'
    `, [], (err, results) => {
      const type = results[0];

      // Fetch all system page modules from database
      connection.query(`
        SELECT * FROM modules
      `, [], (err, modules) => {
        modules.forEach(module => {
          system.modules.push(module.name);
        });

        // Checks if a session already exists
        if (req.session.username) {
          res.render('types/edit', {
            username: req.session.username,
            pathname: '/subterra/types',
            feedback: false,
            feedbackState: false,
            system: {
              modules: system.modules
            },
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

  // Update type in database
  req.getConnection((err, connection) => {
    connection.query(`
      UPDATE types
      SET name = '${ data.name }', defaultModules = '${ data.modules }'
      WHERE id = ${ req.params.id }
    `, [], (err, results) => {
      // Redirect to same page with newly added data
      res.redirect(`/subterra/types/edit/${ req.params.id }`);
    });
  });
});

// [GET] /subterra/types/delete/:id
router.get('/delete/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/types/delete/${ req.params.id }`);

  // Remove page from database
  req.getConnection((err, connection) => {
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
