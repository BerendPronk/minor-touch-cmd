const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra/pages
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/pages`);

  // Object containing system data, after MySQL queries
  let system = {
    pages: [],
    types: []
  };

  // Fetch all pages from database
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT * FROM pages
    `, [], (err, results) => {
      results.forEach(page => {
        // Push pages in system object
        system.pages.push({
          id: page.id,
          title: page.title,
          type: page.type
        });
      });

      connection.query(`
        SELECT * FROM types
      `, [], (err, types) => {
        // Push types in system object
        types.forEach(type => {
          system.types.push(type.name);
        });

        // Checks if a session already exists
        if (req.session.username) {
          res.render('subterra/pages/index', {
            username: req.session.username,
            pathname: '/subterra/pages',
            system: {
              pages: system.pages,
              types: system.types
            },
          });
        } else {
          res.redirect('/subterra/login');
        }
      });
    });
  });
});

// [GET] /subterra/pages/add
router.get('/add/:type', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/add`);

  // Object containing system data, after MySQL queries
  let system = {
    menus: [],
    types: [],
    modules: []
  };

  req.getConnection((err, connection) => {
    // Fetch all system page types from database
    connection.query(`
      SELECT * FROM types
    `, [], (err, types) => {
      // Push types in system object
      types.forEach(type => {
        system.types.push(type.name);
      });

      // Fetch all system page menus from database
      connection.query(`
        SELECT * FROM menus
      `, [], (err, menus) => {
        // Push menus in system object
        menus.forEach(menu => {
          system.menus.push(menu.name);
        });

        // Fetch all system modules from database
        connection.query(`
          SELECT * FROM modules
        `, [], (err, modules) => {
          // Push modules in system object
          modules.forEach(module => {
            system.modules.push(module.name);
          });

          // Fetch defaultModules from page type
          connection.query(`
            SELECT * FROM types
            WHERE name = '${ req.params.type }'
          `, [], (err, type) => {
            const defaultModules = type[0].defaultModules;
            let contentFields = [];

            defaultModules.split(',').forEach((module, index) => {
              switch (module) {
                case 'heading':
                  contentFields.push(`
                    <span class="content-tip">Heading</span>
      							<input name="content-h-${ index }" type="text">
                  `);
                break;
                case 'paragraph':
                  contentFields.push(`
                    <span class="content-tip">Paragraph</span>
      							<textarea name="content-p-${ index }"></textarea>
                  `);
                break;
                case 'image':
                  contentFields.push(`
                    <span class="content-tip">Image</span>
                    <input name="content-i-${ index }" type="file">
                  `);
                break;
                case 'list':
                  contentFields.push(`
                    <span class="content-tip">List name</span>
      							<input name="content-l-name-${ index }" type="text" oninput="addListName()">
      							<span class="content-tip">List items</span>
      							<input name="content-l-list-${ index }" type="hidden">
                    <ul>
      								<li>
      									<input type="text" oninput="addListItem()">
      								</li>
      							</ul>
                    <button data-type="addToList" onclick="addListInput()">Add item</button>
                  `);
                break;
                case 'embed':
                  contentFields.push(`
      							<span class="content-tip">Embedded video (YouTube or Vimeo)</span>
                    <input name="content-e-${ index }" type="text">
                  `);
                break;
              }
            });

            // Checks if a session already exists
            if (req.session.username) {
              res.render('subterra/pages/add', {
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
                  type: req.params.type,
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

// [POST] /subterra/pages/add
router.post('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/add`);

  // Array that will store all content fields
  let contentFields = [];

  // Extract all separate content fields
  Object.keys(req.body).forEach(field => {
    // Early exit to prevent empty fields being stored in database
    if (req.body[field].replace(/ /g, '') === '') {
      return;
    }

    // Switch on content fields only
    if (field.indexOf('content-') !== -1) {
      switch (field.charAt(8).toUpperCase()) {
        case 'H':
          contentFields.push(`|H|${ req.body[field] }`);
        break;
        case 'P':
          contentFields.push(`|P|${ req.body[field] }`);
        break;
        case 'I':
          contentFields.push(`|I|${ req.body[field] }`);
        break;
        case 'L':
          // Only pick grouped input
          if (field.indexOf('content-l-list') !== -1) {
            contentFields.push(`|L|${ req.body[field] }`);
          }
        break;
        case 'E':
          contentFields.push(`|E|${ req.body[field] }`);
        break;
      }
    }
  });

  const data = {
    type: req.body.type,
    title: req.body.title,
    menus: req.body.menus,
    content: contentFields.join('|-|')
  };

  req.getConnection((err, connection) => {
    // Add submitted data to database
    connection.query(`
      INSERT INTO pages SET ?
    `, [data], (err, results) => {
      // Navigate to /subterra/pages overview
      res.redirect('/subterra/pages');
    });
  });
});

// [GET] /subterra/pages/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/edit/${ req.params.id }`);

  // Object containing system data, after MySQL queries
  let system = {
    menus: [],
    types: [],
    modules: []
  };

  // Select page with ID from GET parameter
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT * FROM pages WHERE id = '${ req.params.id }'
    `, [], (err, results) => {
      const page = results[0];

      // Fetch all system page types from database
      connection.query(`
        SELECT * FROM types
      `, [], (err, types) => {
        types.forEach(type => {
          system.types.push(type.name);
        });

        // Fetch all system page menus from database
        connection.query(`
          SELECT * FROM menus
        `, [], (err, menus) => {
          menus.forEach(menu => {
            system.menus.push(menu.name);
          });

          // Fetch all system modules from database
          connection.query(`
            SELECT * FROM modules
          `, [], (err, modules) => {
            modules.forEach(module => {
              system.modules.push(module.name);
            });

            // Array of converted database strings to form inputs
            let contentFields = [];

            page.content.split('|-|').forEach((field, index) => {
              switch (field.charAt(1)) {
                case 'H':
                  contentFields.push(`
      							<span class="content-tip">Heading</span>
                    <input name="content-h-${ index }" type="text" value="${ field.replace('|H|', '') }">
                  `);
                break;
                case 'P':
                  contentFields.push(`
      							<span class="content-tip">Paragraph</span>
                    <textarea name="content-p-${ index }">${ field.replace('|P|', '') }</textarea>
                  `);
                break;
                case 'I':
                  contentFields.push(`
      							<span class="content-tip">Image</span>
                    <img src="${ field.replace('|I|', '') }" alt="${ page.title }">
                    <input name="content-i-${ index }" type="file">
                  `);
                break;
                case 'L':
                  // Divide content string into separate fields
                  const content = field.replace('|L|', '');
                  const divider = content.indexOf('|');
                  const fieldListName = content.substr(0, divider);
                  const fieldList = content.substr((divider + 1), content.length).split(',');
                  let fieldListString = '';

                  // Give HTML to each item in list
                  fieldList.forEach(item => {
                    fieldListString += `
                      <li>
                        <input type="text" value="${ item }" oninput="addListItem()">
                      </li>
                    `;
                  });

                  contentFields.push(`
      							<span class="content-tip">List name</span>
                    <input name="content-l-name-${ index }" type="text" value="${ fieldListName }" oninput="addListName()">
      							<span class="content-tip">List items</span>
                    <input name="content-l-list-${ index }" type="hidden" value="${ content }">
                    <ul>
                      ${ fieldListString }
                    </ul>
                    <button data-type="addToList" onclick="addListInput()">Add item</button>
                  `);
                break;
                case 'E':
                  contentFields.push(`
      							<span class="content-tip">Embedded video (YouTube or Vimeo)</span>
                    <input name="content-e-${ index }" type="text" value="${ field.replace('|E|', '') }">
                  `);
                break;
              }
            });

            // Checks if a session already exists
            if (req.session.username) {
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
                  type: page.type,
                  title: page.title,
                  menus: page.menus.split(',').filter(e => {
                    // Removes empty data fields
                    return e;
                  }),
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

  // Array that will store all content fields
  let contentFields = [];

  // Extract all separate content fields
  Object.keys(req.body).forEach(field => {
    // Early exit to prevent empty fields being stored in database
    if (req.body[field].replace(/ /g, '') === '') {
      return;
    }

    // Switch on content fields only
    if (field.indexOf('content-') !== -1) {
      switch (field.charAt(8).toUpperCase()) {
        case 'H':
          contentFields.push(`|H|${ req.body[field] }`);
        break;
        case 'P':
          contentFields.push(`|P|${ req.body[field] }`);
        break;
        case 'I':
          contentFields.push(`|I|${ req.body[field] }`);
        break;
        case 'L':
          // Only pick grouped input
          if (field.indexOf('content-l-list') !== -1) {
            contentFields.push(`|L|${ req.body[field] }`);
          }
        break;
        case 'E':
          contentFields.push(`|E|${ req.body[field] }`);
        break;
      }
    }
  });

  const data = {
    type: req.body.type,
    title: req.body.title,
    menus: req.body.menus,
    content: contentFields.join('|-|')
  };

  req.getConnection((err, connection) => {
  //   connection.query(`
  //     SELECT * FROM menus
  //   `, [], (err, menus) => {
  //     menus.forEach(menu => {
  //       let menuParents = menu.parents.split(',');
  //       let menuChildren = menu.children.split(',');
  //       let pageMenuItems = data.parents.split(',');
  //
  //       // Remove empty array values from database
  //       menuParents = menuParents.filter(e => {
  //         return e;
  //       });
  //       menuChildren = menuChildren.filter(e => {
  //         return e;
  //       });
  //
  //       // Check if slug already exists
  //       if (menu.id !== req.params.id && menu.slug === data.title) {
  //         debug('Slug already exists');
  //       }
  //
  //       pageMenuItems.forEach(slug => {
  //         // Check if page in 'menus' table matches page title
  //         if (menu.slug === data.title) {
  //           // Pushes every parent from list to menuParents array
  //           menuParents.push(slug);
  //
  //           // Add parents to page in database
  //           connection.query(`
  //             UPDATE menus
  //             SET parents = '${ pageMenuItems.join(',') }'
  //             WHERE slug = '${ data.title }'
  //           `);
  //         }
  //
  //         // Check if parent in 'menus' table matches slug
  //         if (menu.slug === slug) {
  //           // Add slug if it isn't already added to parent
  //           if (menuChildren.indexOf(data.title) === -1) {
  //             menuChildren.push(data.title);
  //
  //             // Add page to parent's children in database
  //             connection.query(`
  //               UPDATE menus
  //               SET children = '${ menuChildren.join(',') }'
  //               WHERE slug = '${ slug }'
  //             `);
  //           }
  //         } else {
  //           // Check if passing slug constists in pageMenuItems
  //           if (pageMenuItems.indexOf(menu.slug) === -1) {
  //             // Check if parent has an unwanted child
  //             if (menuChildren.indexOf(data.title) !== -1) {
  //               // Remove deleted child from parent's childs
  //               menuChildren.splice(menuChildren.indexOf(data.title), 1);
  //
  //               // Add updates list of children to parent's childs
  //               connection.query(`
  //                 UPDATE menus
  //                 SET children = '${ menuChildren.join(',') }'
  //                 WHERE slug = '${ menu.slug }'
  //               `);
  //             }
  //           }
  //         }
  //       });
  //     })
  //   });

    // Update data from page
    connection.query(`
      UPDATE pages
      SET type = '${ data.type }', title = '${ data.title }', menus = '${ data.menus }', content = '${ data.content }'
      WHERE id = ${ req.params.id }
    `, [], (err, results) => {
      // Redirect to current page with newly added data
      res.redirect(`/subterra/pages/edit/${ req.params.id }`);
    });
  });
});

module.exports = router;
