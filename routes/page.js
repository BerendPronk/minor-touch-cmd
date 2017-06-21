const debug = require('debug')('TouchCMD');
const breadcrumb = require('../assets/script/modules/breadcrumb');
const express = require('express');
const router = express.Router();

// [GET] /page/:page
router.get('/:page', (req, res) => {
  debug(`[${ req.method }] /page/${ req.params.page }`);

  // Convert page title dashes back to spaces
  const title = req.params.page.replace(/-/g, ' ');

  req.getConnection((err, connection) => {
    // Select page with title from GET parameter
    connection.query(`
      SELECT * FROM pages
      WHERE title = '${ title }'
    `, [], (err, pages) => {
      const page = pages[0];

      // Page menu specific variables
      const pageMenus = page.menus.split(',');
      let menuChildren = [];

      // Will store ordered HTML content
      let contentBlocks = [];

      // Process page content to HTML
      page.content.split('|-|').forEach(block => {
        switch (block.charAt(1)) {
          case 'H':
            contentBlocks.push(`
              <h3>${ block.replace('|H|', '') }</h3>
            `);
          break;
          case 'P':
            contentBlocks.push(`
              <p>${ block.replace('|P|', '') }</p>
            `);
          break;
          case 'I':
            contentBlocks.push(`
              <img src="/media/${ block.replace('|I|', '') }" alt="Image about ${ page.title }">
            `);
          break;
          case 'L':
            const listContent = block.replace('|L|', '').split('|');
            const listName = listContent[0];
            const list = listContent[1].split(',');
            let listString = '';

            // Give HTML to each item in list
            list.forEach(item => {
              listString += `
                <li>
                  ${ item }
                </li>
              `;
            });

            contentBlocks.push(`
              <h4>${ listName }</h4>
              <ul>
                ${ listString }
              </ul>
            `);
          break;
          case 'E':
            const host = block.replace('|E|', '');

            // Check source of embedded video
            if (host.indexOf('youtube.com') !== -1) {
              contentBlocks.push(`
                <iframe width="640" height="360" src="https://www.youtube.com/embed/${ host.split('.com/watch?v=')[1] }" frameborder="0" allowfullscreen></iframe>
              `);
            } else if (host.indexOf('vimeo.com') !== -1) {
              contentBlocks.push(`
                <iframe width="640" height="360" src="https://player.vimeo.com/video/${ host.split('.com/')[1].replace('/', '') }" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
              `);
            } else {
              contentBlocks.push(`
                <a href="${ host }">${ host }</a>
              `)
            }
          break;
          case 'B':
            const buttonContent = block.replace('|B|', '').split('|');
            const buttonName = buttonContent[0];
            const buttonAnchor = buttonContent[1].split('-')[1];

            contentBlocks.push(`
              <a href="/page/${ buttonAnchor.replace(/ /g, '-').toLowerCase() }" class="button">${ buttonName }</a>
            `);
          break;
        }
      });

      // Fetch all menus from database
      connection.query(`
        SELECT * FROM menus
      `, [], (err, menus) => {

        // Fetch all pages from database
        connection.query(`
          SELECT * FROM pages
        `, [], (err, pages) => {

          // Pushes array of each page menu's children
          pageMenus.forEach(pageMenu => {
            menus.forEach(menu => {
              if (menu.name === pageMenu) {
                const children = menu.children.split(',');
                let pageData = [];

                // Retrieve type from children
                children.forEach(child => {
                  pages.forEach(page => {
                    if (page.title === child) {
                      // Push both type and title in array
                      pageData.push({
                        type: page.type,
                        title: child
                      });
                    }
                  });
                });

                // Add page data array to menu chidlren array
                menuChildren.push(pageData);
              }
            });
          });

          // Render page view
          res.render('page', {
            tv: req.session.tv,
            parent: breadcrumb.retrieve(page.title),
            page: {
              type: page.type.replace(/ /g, '-'),
              title: page.title,
              menus: pageMenus.filter(e => {
                // Removes empty data fields
                return e;
              }),
              menuChildren: menuChildren,
              content: contentBlocks
            }
          });
        });
      });
    });
  });
});

module.exports = router;
