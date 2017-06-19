// Retrieve data from database
// connection: express-connection
// opts:
// {
//   storage: Object,
//   category: String,
//   tables: Array,
//   callback: Function
// }
const retrieve = (connection, opts) => {
  // Check if callback function has been added
  if (opts && opts.callback) {
    // Define system storage
    let system = {
      types: [],
      menus: [],
      pages: [],
      courses: [],
      modules: [],
      faq: []
    };

    // Define category based on given options, or set default to undefined
    const category = opts.category || undefined;

    // Define tables to query based on given options, or set default to all
    const tables = opts.tables || ['types', 'menus', 'pages', 'modules'];

    // Apply queries to set database content in system variable
    // -
    // Fetch all system page types from database
    connection.query(`
      SELECT * FROM types
    `, [], (err, types) => {
      // Push types in system object
      if (tables.includes('types')) {
        switch (category) {
          case 'types':
            types.forEach(type => {
              system.types.push({
                name: type.name,
                modules: type.defaultModules
              });
            });
          break;
          default:
            types.forEach(type => {
              system.types.push(type.name);
            });
        }
      }

      // Fetch all system page menus from database
      connection.query(`
        SELECT * FROM menus
      `, [], (err, menus) => {
        // Push menus in system object
        if (tables.includes('menus')) {
          menus.forEach(menu => {
            system.menus.push(menu.name);
          });
        }

        // Fetch all system pages from database
        connection.query(`
          SELECT * FROM pages
        `, [], (err, pages) => {
          if (tables.includes('pages')) {
            switch (category) {
              case 'pages':
                // Push pages in system object
                pages.forEach(page => {
                  system.pages.push(`${ page.id }-${ page.title }`);
                });
              break;
              case 'portfolio':
                // Push pages in system object
                pages.forEach(page => {
                  if (page.type === 'course') {
                    system.courses.push(page.title);
                  }
                });
              break;
              default:
                // Push pages in system object
                pages.forEach(page => {
                  system.pages.push(page.title);
                });
            }
          }

          // Fetch all system modules from database
          connection.query(`
            SELECT * FROM portfolio
          `, [], (err, portfolio) => {
            // Push modules in system object
            if (tables.includes('portfolio')) {
              portfolio.forEach(item => {
                system.portfolio.push(item.title);
              });
            }

            // Fetch all system modules from database
            connection.query(`
              SELECT * FROM modules
            `, [], (err, modules) => {
              // Push modules in system object
              if (tables.includes('modules')) {
                modules.forEach(module => {
                  system.modules.push(module.name);
                });
              }

              // Fetch all system FAQ questions from database
              connection.query(`
                SELECT * FROM faq
              `, [], (err, faq) => {
                // Push FAQ questions in system object
                if (tables.includes('faq')) {
                  faq.forEach(question => {
                    system.faq.push(question.question);
                  });
                }

                // Execute callback
                opts.callback(system);
              });
            });
          });
        });
      });
    });
  } else {
    console.error('[database.retrieve] No callback function given.');
  }
};

// Search in database tables on specific keyword
// connection: express-connection
// opts:
// {
//   query: String,
//   callback: Function
// }
const search = (connection, opts) => {
  if (opts && opts.callback) {
    // Define results storage
    let results = {
      types: [],
      menus: [],
      pages: [],
      portfolio: [],
      faq: []
    };

    // Define search query, or set default to search entire database
    const query = opts.query || '';

    // Apply queries to set database content in system variable
    // -
    // Fetch all system types from database that contain query
    connection.query(`
      SELECT * FROM types
      WHERE name LIKE '%${ query }%'
    `, [], (err, types) => {
      // Push types in results object
      types.forEach(type => {
        results.types.push({
          id: type.id,
          name: type.name
        });
      });

      // Fetch all system menus from database that contain query
      connection.query(`
        SELECT * FROM menus
        WHERE name LIKE '%${ query }%'
      `, [], (err, menus) => {
        // Push menus in results object
        menus.forEach(menu => {
          results.menus.push({
            id: menu.id,
            name: menu.name
          });
        });

        // Fetch all system pages from database that contain query
        connection.query(`
          SELECT * FROM pages
          WHERE title LIKE '%${ query }%'
        `, [], (err, pages) => {
          // Push pages in results object
          pages.forEach(page => {
            results.pages.push({
              id: page.id,
              name: page.title
            });
          });

          // Fetch all system portolio items from database that contain query
          connection.query(`
            SELECT * FROM portfolio
            WHERE title LIKE '%${ query }%'
          `, [], (err, portfolio) => {
            // Push portfolio items in results object
            portfolio.forEach(item => {
              results.portfolio.push({
                id: item.id,
                name: item.title
              });
            });

            // Fetch all system FAQ questions from database that contain query
            connection.query(`
              SELECT * FROM faq
              WHERE question LIKE '%${ query }%'
            `, [], (err, faq) => {
              // Push FAQ questions in results object
              faq.forEach(question => {
                results.faq.push({
                  id: question.id,
                  name: question.question + '?'
                })
              });

              // Execute callback
              opts.callback(results);
            });
          });
        });
      });
    });
  } else {
    console.error('[database.search] No callback function given.');
  }
};

// Export functions
module.exports = {
  retrieve: retrieve,
  search: search
};
