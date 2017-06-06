const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra/pages
router.get('/', (req, res) => {
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

      // Checks if a session already exists
      if (req.session.username) {
        res.render('subterra/pages/index', {
          username: req.session.username,
          pathname: '/subterra/pages',
          pages: pages
        });
      } else {
        res.redirect('/subterra/login');
      }
    });
  });

});

// [GET] /subterra/pages/add
router.get('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/add`);

  // Checks if a session already exists
  if (req.session.username) {

  } else {
    res.redirect('/subterra/login');
  }
});

// [GET] /subterra/pages/edit/:id
router.get('/edit/:id', (req, res) => {
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
            modules.forEach(module => {
              system.modules.push(module.name);
            });

            // Convert database string to form inputs
            let contentFields = [];

            page.content.split('|-|').forEach((field, index) => {
              switch (field.charAt(1)) {
                case 'H':
                contentFields.push(`
                  <input name="content-h-${ index }" type="text" value="${ field.replace('|H|', '') }">`);
                  break;
                case 'P':
                  contentFields.push(`
                    <textarea name="content-p-${ index }">${ field.replace('|P|', '') }</textarea>`);
                break;
                case 'I':
                  contentFields.push(`
                    <img src="${ field.replace('|I|', '') }" alt="${ page.title }">
                    <input name="content-i-${ index }" type="file">`);
                break;
                case 'L':
                  // Place all splitted items inside text-inputs

                  contentFields.push(`
                    <li>
                      <input name="content-l-name-${ index }" type="text">
                      <input name="content-l-${ index }" type="hidden">
                      <ul data-list="${ index }">
                        ${ field.replace('|L|', '').split(',').join('</li><li>') }
                      </ul>
                      <button data-type="addToList-${ index }">Add item</button>
                    </li>`);
                break;
                case 'E':
                  if (field.indexOf('|E-Y|') !== -1) {
                    field.replace('|E-Y|', '');

                    contentFields.push(`placeembedlinkhere`);
                  } else if (field.indexOf('|E-V|') !== -1) {
                    field.replace('|E-V|', '');

                    contentFields.push(`placeembedlinkhere`);
                  }
                break;
              }
            });

            // Checks if a session already exists
            // if (req.session.username) {
            if (1==1) {
              // Render edit page
              res.render('subterra/pages/edit', {
                username: req.session.username,
                pathname: '/subterra/pages',
                feedback: false,
                feedbackState: false,
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
                  content: contentFields
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
router.post('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/edit/${ req.params.id }`);
  let contentFields = [];

  // Extract all separate content fields
  Object.keys(req.body).forEach(field => {
    if (field.indexOf('content-') !== -1) {
      switch (field.charAt(8)) {
        case 'h':
          contentFields.push(`|H|${ req.body[field] }`);
        break;
        case 'p':
          contentFields.push(`|P|${ req.body[field] }`);
        break;
        case 'i':
          contentFields.push(`|I|${ req.body[field] }`);
        break;
        case 'l':
          // contentFields.push(`|I|${ req.body[field] }`);
        break;
        case 'e':
          // contentFields.push(`|E|${ req.body[field] }`);
        break;
      }
    }
  });

  const data = {
    type: req.body.type,
    title: req.body.title,
    parents: req.body.parents,
    content: contentFields.join('|-|')
  };

  req.getConnection((err, connection) => {
    let test = []

    connection.query(`
      SELECT * FROM menus
    `, [], (err, menus) => {
      menus.forEach(menu => {
        let menuParents = menu.parents.split(',');
        let menuChildren = menu.children.split(',');
        let pageMenuItems = data.parents.split(',');

        // Remove empty array values from database
        menuParents = menuParents.filter(e => {
          return e;
        });
        menuChildren = menuChildren.filter(e => {
          return e;
        });

        // Check if slug already exists
        if (menu.id !== req.params.id && menu.slug === data.title) {
          debug('Slug already exists');
        }

        pageMenuItems.forEach(slug => {
          // Check if page in 'menus' table matches page title
          if (menu.slug === data.title) {
            // Pushes every parent from list to menuParents array
            menuParents.push(slug);

            // Add parents to page in database
            connection.query(`
              UPDATE menus
              SET parents = '${ pageMenuItems.join(',') }'
              WHERE slug = '${ data.title }'
            `);
          }

          // Check if parent in 'menus' table matches slug
          if (menu.slug === slug) {
            // Add slug if it isn't already added to parent
            if (menuChildren.indexOf(data.title) === -1) {
              menuChildren.push(data.title);

              // Add page to parent's children in database
              connection.query(`
                UPDATE menus
                SET children = '${ menuChildren.join(',') }'
                WHERE slug = '${ slug }'
              `);
            }
          } else {
            // Check if passing slug constists in pageMenuItems
            if (pageMenuItems.indexOf(menu.slug) === -1) {
              // Check if parent has an unwanted child
              if (menuChildren.indexOf(data.title) !== -1) {
                // Remove deleted child from parent's childs
                menuChildren.splice(menuChildren.indexOf(data.title), 1);

                // Add updates list of children to parent's childs
                connection.query(`
                  UPDATE menus
                  SET children = '${ menuChildren.join(',') }'
                  WHERE slug = '${ menu.slug }'
                `);
              }
            }
          }
        });
      })
    });

    // Convert content to proper storage

    // Update data from page
    connection.query(`
      UPDATE pages
      SET type = '${ data.type }', title = '${ data.title }', parents = '${ data.parents }', content = '${ data.content }'
      WHERE id = ${ req.params.id }
    `, [], (err, results) => {
      // Redirect to same page with newly added data
      res.redirect(`/subterra/pages/edit/${ req.params.id }`);
    });
  });
});

module.exports = router;
