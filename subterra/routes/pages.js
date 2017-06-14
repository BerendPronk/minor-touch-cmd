const debug = require('debug')('TouchCMD');
const database = require('../../subterra/assets/script/modules/database');
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

  req.getConnection((err, connection) => {
    // Fetch all pages from database
    connection.query(`
      SELECT * FROM pages
    `, [], (err, pages) => {
      pages.forEach(page => {
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
          res.render('pages/index', {
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

  req.getConnection((err, connection) => {
    // Fetch system data from database
    database.retrieve(connection, {
      category: 'pages',
      tables: ['types', 'menus', 'pages', 'modules'],
      callback: systemData => {
        // Fetch defaultModules from page type
        connection.query(`
          SELECT * FROM types
          WHERE name = '${ req.params.type }'
        `, [], (err, type) => {
          const defaultModules = type[0].defaultModules;
          let contentFields = [];

          // Apply default modules to content string
          defaultModules.split(',').forEach((module, index) => {
            switch (module) {
              case 'heading':
                contentFields.push(`
                  <span class="content-tip">Heading</span>
                  <input name="content-h-${ index }" type="text" onblur="setInput()">
                `);
              break;
              case 'paragraph':
                contentFields.push(`
                  <span class="content-tip">Paragraph</span>
                  <textarea name="content-p-${ index }" onblur="setInput()"></textarea>
                `);
              break;
              case 'image':
                contentFields.push(`
                  <span class="content-tip">Image</span>
                  <input name="content-i-name-${ index }" type="hidden">
                  <input name="content-i-${ index }" type="file" accept="image/*" onblur="setImageName()">
                `);
              break;
              case 'list':
                contentFields.push(`
                  <span class="content-tip">List name</span>
                  <input name="content-l-name-${ index }" type="text" oninput="addListName()" onblur="setInput()">
                  <span class="content-tip">List items</span>
                  <input name="content-l-list-${ index }" type="hidden">
                  <ul>
                    <li>
                      <input type="text" oninput="addListItem()" onblur="setInput()">
                    </li>
                  </ul>
                  <button data-type="addToList" onclick="addListInput()">Add item</button>
                `);
              break;
              case 'embed':
                contentFields.push(`
                  <span class="content-tip">Embedded video (YouTube or Vimeo)</span>
                  <input name="content-e-${ index }" type="text" onblur="setInput()">
                `);
              break;
              case 'button':
                let systemPagesString;

                systemData.pages.forEach(page => {
                  const pageTitle = page.split('-')[1];

                  systemPagesString = `
                    ${ systemPagesString }
                    <option value="${ page }">
                      ${ pageTitle }
                    </option>
                  `;
                });

                contentFields.push(`
                  <span class="content-tip">Button name</span>
                  <input name="content-b-name-${ index }" type="text" oninput="setButtonName()">
                  <span class="content-tip">Button link</span>
                  <input name="content-b-link-${ index }" type="hidden">
                  <select name="content-b-anchor-${ index }" oninput="setButtonAnchor()">
                    <option value="" disabled selected>Select a page</option>
                    ${ systemPagesString }
                  </select>
                `);
              break;
            }
          });

          // Checks if a session already exists
          if (req.session.username) {
            res.render('pages/add', {
              username: req.session.username,
              pathname: '/subterra/pages',
              feedback: false,
              feedbackState: false,
              system: systemData,
              page: {
                type: req.params.type,
                content: contentFields
              }
            });
          } else {
            res.redirect('/subterra/login');
          }
        });
      }
    });
  });
});

// [POST] /subterra/pages/add
router.post('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/add`);

  // Array that will store all content fields
  let content = [];

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
          content.push(`|H|${ req.body[field] }`);
        break;
        case 'P':
          content.push(`|P|${ req.body[field] }`);
        break;
        case 'I':
          // Only pick image name input
          if (field.indexOf('content-i-name') !== -1) {
            content.push(`|I|${ req.body[field] }`);
          }
        break;
        case 'L':
          // Only pick grouped input
          if (field.indexOf('content-l-list') !== -1) {
            content.push(`|L|${ req.body[field] }`);
          }
        break;
        case 'E':
          content.push(`|E|${ req.body[field] }`);
        break;
        case 'B':
          // Only pick grouped input
          if (field.indexOf('content-b-link') !== -1) {
            content.push(`|B|${ req.body[field] }`);
          }
        break;
      }
    }
  });

  const data = {
    type: req.body.type,
    title: req.body.title.replace(/'/g, '"'),
    menus: req.body.menus,
    content: content.join('|-|').replace(/'/g, '"')
  };

  req.getConnection((err, connection) => {
    // Fetch all pages from database
    connection.query(`
      SELECT * FROM pages
    `, [], (err, pages) => {
      let exists;

      // Check if page title already exists
      pages.forEach(page => {
        if (page.title === data.title) {
          exists = true;
        }
      });

      if (!exists) {
        // Add submitted data to database
        connection.query(`
          INSERT INTO pages SET ?
        `, [data], (err, results) => {
          // Navigate to /subterra/pages overview
          res.redirect('/subterra/pages');
        });
      } else {
        // Fetch system data from database
        database.retrieve(connection, {
          category: 'pages',
          tables: ['types', 'menus', 'pages', 'modules'],
          callback: systemData => {
            // Fetch defaultModules from page type
            connection.query(`
              SELECT * FROM types
              WHERE name = '${ data.type }'
            `, [], (err, type) => {
              const defaultModules = type[0].defaultModules;
              let contentFields = [];

              // Apply default modules to content string
              defaultModules.split(',').forEach((module, index) => {
                switch (module) {
                  case 'heading':
                    contentFields.push(`
                      <span class="content-tip">Heading</span>
                      <input name="content-h-${ index }" type="text" onblur="setInput()">
                    `);
                  break;
                  case 'paragraph':
                    contentFields.push(`
                      <span class="content-tip">Paragraph</span>
                      <textarea name="content-p-${ index }" onblur="setInput()"></textarea>
                    `);
                  break;
                  case 'image':
                    contentFields.push(`
                      <span class="content-tip">Image</span>
                      <input name="content-i-name-${ index }" type="hidden">
                      <input name="content-i-${ index }" type="file" accept="image/*" onblur="setImageName()">
                    `);
                  break;
                  case 'list':
                    contentFields.push(`
                      <span class="content-tip">List name</span>
                      <input name="content-l-name-${ index }" type="text" oninput="addListName()" onblur="setInput()">
                      <span class="content-tip">List items</span>
                      <input name="content-l-list-${ index }" type="hidden">
                      <ul>
                        <li>
                          <input type="text" oninput="addListItem()" onblur="setInput()">
                        </li>
                      </ul>
                      <button data-type="addToList" onclick="addListInput()">Add item</button>
                    `);
                  break;
                  case 'embed':
                    contentFields.push(`
                      <span class="content-tip">Embedded video (YouTube or Vimeo)</span>
                      <input name="content-e-${ index }" type="text" onblur="setInput()">
                    `);
                  break;
                  case 'button':
                    let systemPagesString;

                    systemData.pages.forEach(page => {
                      const pageTitle = page.split('-')[1];

                      systemPagesString = `
                        ${ systemPagesString }
                        <option value="${ page }">
                          ${ pageTitle }
                        </option>
                      `;
                    });

                    contentFields.push(`
                      <span class="content-tip">Button name</span>
                      <input name="content-b-name-${ index }" type="text" oninput="setButtonName()">
                      <span class="content-tip">Button link</span>
                      <input name="content-b-link-${ index }" type="hidden">
                      <select name="content-b-anchor-${ index }" oninput="setButtonAnchor()">
                        <option value="" disabled selected>Select a page</option>
                        ${ systemPagesString }
                      </select>
                    `);
                  break;
                }
              });

              res.render('pages/add', {
                username: req.session.username,
                pathname: '/subterra/pages',
                feedback: `Page with title '${ data.title }' already exists.`,
                feedbackState: 'negative',
                system: systemData,
                page: {
                  type: data.type,
                  content: contentFields
                }
              });
            });
          }
        });
      }
    });
  });
});

// [GET] /subterra/pages/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/edit/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Select page with ID from GET parameter
    connection.query(`
      SELECT * FROM pages
      WHERE id = '${ req.params.id }'
    `, [], (err, pages) => {
      const page = pages[0];
      let contentFields = [];

      // Fetch all system page types from database
      database.retrieve(connection, {
        category: 'pages',
        tables: ['types', 'menus', 'pages', 'modules'],
        callback: systemData => {
          // Process output to content fields
          page.content.split('|-|').forEach((field, index) => {
            switch (field.charAt(1)) {
              case 'H':
                contentFields.push(`
                  <span class="content-tip">Heading</span>
                  <input name="content-h-${ index }" type="text" onblur="setInput()" value="${ field.replace('|H|', '') }">
                `);
              break;
              case 'P':
                contentFields.push(`
                  <span class="content-tip">Paragraph</span>
                  <textarea name="content-p-${ index }" onblur="setInput()">${ field.replace('|P|', '') }</textarea>
                `);
              break;
              case 'I':
                contentFields.push(`
                  <span class="content-tip">Image</span>
                  <img src="/media/${ field.replace('|I|', '') }" alt="Image about ${ page.title }">
                  <input name="content-i-name-${ index }" type="hidden" value="${ field.replace('|I|', '') }">
                  <input name="content-i-${ index }" type="file" accept="image/*" onblur="setImageName()">
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
                    <input type="text" oninput="addListItem()" onblur="setInput()" value="${ item }">
                  </li>
                  `;
                });

                contentFields.push(`
                  <span class="content-tip">List name</span>
                  <input name="content-l-name-${ index }" type="text" oninput="addListName()" onblur="setInput()" value="${ fieldListName }">
                  <span class="content-tip">List items</span>
                  <input name="content-l-list-${ index }" type="hidden" onblur="setInput()" value="${ content }">
                  <ul>
                    ${ fieldListString }
                  </ul>
                  <button data-type="addToList" onclick="addListInput()">Add item</button>
                `);
              break;
              case 'E':
                contentFields.push(`
                  <span class="content-tip">Embedded video (YouTube or Vimeo)</span>
                  <input name="content-e-${ index }" type="text" onblur="setInput()" value="${ field.replace('|E|', '') }">
                `);
              break;
              case 'B':
                let systemPagesString;
                const fieldButtonName = field.replace('|B|', '').split('|')[0];
                const fieldButtonAnchor =  field.replace('|B|', '').split('|')[1].split('-')[1];

                systemData.pages.forEach(page => {
                  const pageTitle = page.split('-')[1];

                  systemPagesString = `
                    ${ systemPagesString }
                    <option value="${ page }" ${ fieldButtonAnchor === pageTitle ? 'selected' : '' }>
                      ${ pageTitle }
                    </option>
                  `;
                });

                contentFields.push(`
                  <span class="content-tip">Button name</span>
                  <input name="content-b-name-${ index }" type="text" oninput="setButtonName()" onblur="setInput()" value="${ fieldButtonName }">
                  <span class="content-tip">Button link</span>
                  <input name="content-b-link-${ index }" type="hidden" value="${ field.replace('|B|', '') }">
                  <select name="content-b-anchor-${ index }" oninput="setButtonAnchor()" onblur="setInput()">
                    <option value="" disabled selected>Select a page</option>
                    ${ systemPagesString }
                  </select>
                `);
              break;
            }
          });

          // Checks if a session already exists
          if (req.session.username) {
            // Render edit page
            res.render('pages/edit', {
              username: req.session.username,
              pathname: '/subterra/pages',
              feedback: false,
              feedbackState: false,
              system: systemData,
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
        }
      });
    });
  });
});

// [POST] /subterra/pages/edit/:id
router.post('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/edit/${ req.params.id }`);

  // Array that will store all content fields
  let content = [];

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
          content.push(`|H|${ req.body[field] }`);
        break;
        case 'P':
          content.push(`|P|${ req.body[field] }`);
        break;
        case 'I':
          // Only pick image name input
          if (field.indexOf('content-i-name') !== -1) {
            content.push(`|I|${ req.body[field] }`);
          }
        break;
        case 'L':
          // Only pick grouped input
          if (field.indexOf('content-l-list') !== -1) {
            content.push(`|L|${ req.body[field] }`);
          }
        break;
        case 'E':
          content.push(`|E|${ req.body[field] }`);
        break;
        case 'B':
          // Only pick grouped input
          if (field.indexOf('content-b-link') !== -1) {
            content.push(`|B|${ req.body[field] }`);
          }
        break;
      }
    }
  });

  const data = {
    type: req.body.type,
    title: req.body.title.replace(/'/g, '"'),
    menus: req.body.menus,
    content: content.join('|-|').replace(/'/g, '"')
  };

  req.getConnection((err, connection) => {
    // Fetch all pages from database
    connection.query(`
      SELECT * FROM pages
    `, [], (err, pages) => {
      let exists;

      // Check if page title already exists
      pages.forEach(page => {
        if (page.id != req.params.id && page.title === data.title) {
          exists = true;
        }
      });

      if (!exists) {
        // Update data from page
        connection.query(`
          UPDATE pages
          SET type = '${ data.type }', title = '${ data.title }', menus = '${ data.menus }', content = '${ data.content }'
          WHERE id = ${ req.params.id }
        `, [], (err, results) => {
          // Navigate to /subterra/pages overview
          res.redirect('/subterra/pages');
        });
      } else {
        // Select page with ID from GET parameter
        connection.query(`
          SELECT * FROM pages
          WHERE id = '${ req.params.id }'
        `, [], (err, pages) => {
          const page = pages[0];
          let contentFields = [];

          // Fetch system data from database
          database.retrieve(connection, {
            category: 'pages',
            tables: ['types', 'menus', 'pages', 'modules'],
            callback: systemData => {
              // Process output to content fields
              page.content.split('|-|').forEach((field, index) => {
                switch (field.charAt(1)) {
                  case 'H':
                    contentFields.push(`
                      <span class="content-tip">Heading</span>
                      <input name="content-h-${ index }" type="text" onblur="setInput()" value="${ field.replace('|H|', '') }">
                    `);
                  break;
                  case 'P':
                    contentFields.push(`
                      <span class="content-tip">Paragraph</span>
                      <textarea name="content-p-${ index }" onblur="setInput()">${ field.replace('|P|', '') }</textarea>
                    `);
                  break;
                  case 'I':
                    contentFields.push(`
                      <span class="content-tip">Image</span>
                      <img src="/media/${ field.replace('|I|', '') }" alt="Image about ${ page.title }">
                      <input name="content-i-name-${ index }" type="hidden" value="${ field.replace('|I|', '') }">
                      <input name="content-i-${ index }" type="file" accept="image/*" onblur="setImageName()">
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
                        <input type="text" oninput="addListItem()" onblur="setInput()" value="${ item }">
                      </li>
                      `;
                    });

                    contentFields.push(`
                      <span class="content-tip">List name</span>
                      <input name="content-l-name-${ index }" type="text" oninput="addListName()" onblur="setInput()" value="${ fieldListName }">
                      <span class="content-tip">List items</span>
                      <input name="content-l-list-${ index }" type="hidden" onblur="setInput()" value="${ content }">
                      <ul>
                        ${ fieldListString }
                      </ul>
                      <button data-type="addToList" onclick="addListInput()">Add item</button>
                    `);
                  break;
                  case 'E':
                    contentFields.push(`
                      <span class="content-tip">Embedded video (YouTube or Vimeo)</span>
                      <input name="content-e-${ index }" type="text" onblur="setInput()" value="${ field.replace('|E|', '') }">
                    `);
                  break;
                  case 'B':
                    let systemPagesString;
                    const fieldButtonName = field.replace('|B|', '').split('|')[0];
                    const fieldButtonAnchor =  field.replace('|B|', '').split('|')[1].split('-')[1];

                    systemData.pages.forEach(page => {
                      const pageTitle = page.split('-')[1];

                      systemPagesString = `
                        ${ systemPagesString }
                        <option value="${ page }" ${ fieldButtonAnchor === pageTitle ? 'selected' : '' }>
                          ${ pageTitle }
                        </option>
                      `;
                    });

                    contentFields.push(`
                      <span class="content-tip">Button name</span>
                      <input name="content-b-name-${ index }" type="text" oninput="setButtonName()" onblur="setInput()" value="${ fieldButtonName }">
                      <span class="content-tip">Button link</span>
                      <input name="content-b-link-${ index }" type="hidden" value="${ field.replace('|B|', '') }">
                      <select name="content-b-anchor-${ index }" oninput="setButtonAnchor()" onblur="setInput()">
                        <option value="" disabled selected>Select a page</option>
                        ${ systemPagesString }
                      </select>
                    `);
                  break;
                }
              });

              // Render edit page
              res.render('pages/edit', {
                username: req.session.username,
                pathname: '/subterra/pages',
                feedback: `Page with title '${ data.title }' already exists.`,
                feedbackState: 'negative',
                system: systemData,
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
            }
          });
        });
      }
    });
  });
});

// [GET] /subterra/pages/delete/:id
router.get('/delete/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/pages/delete/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Retrieve page name
    connection.query(`
      SELECT * FROM pages
      WHERE id = ${ req.params.id }
    `, [], (err, pages) => {
      const page = pages[0].title;

      // Remove page included in menus table (',page' - 'page,' - 'page')
      connection.query(`
        UPDATE menus
        SET children = REPLACE(REPLACE(REPLACE(children, ',${ page }', ''), '${ page },', ''), '${ page }', '')
      `, [], (err, menus) => {

        // Remove page included in portfolio table (',page' - 'page,' - 'page')
        connection.query(`
          UPDATE portfolio
          SET courses = REPLACE(REPLACE(REPLACE(courses, ',${ page }', ''), '${ page },', ''), '${ page }', '')
        `, [], (err, portfolio) => {

          // Remove page from database
          connection.query(`
            DELETE FROM pages
            WHERE id = ${ req.params.id }
            `, [], (err, results) => {
              // Redirect to page overview page
              res.redirect('/subterra/pages');
            });
        });
      });
    });
  });
});

module.exports = router;
