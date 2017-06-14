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
  if (opts.callback) {
    // Define storage based on given options, or set default
    let system = {
      types: [],
      menus: [],
      pages: [],
      courses: [],
      modules: []
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
        types.forEach(type => {
          system.types.push(type.name);
        });
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
              case 'menus':
                // Push pages in system object
                pages.forEach(page => {
                  system.pages.push(page.title);
                });
              break;
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

              opts.callback(system);
            });
          });
        });
      });
    });
  } else {
    console.error('[database.retrieve] No callback function given.');
  }
};

exports.retrieve = retrieve;
