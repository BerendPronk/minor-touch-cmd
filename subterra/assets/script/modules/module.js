// Subterra content module related functions
const module = (() => {

  // Add an empty module to the page content fields
  const add = () => {
    const pageContent = document.querySelector('#pageContent');
    const index = pageContent.children.length;
    let newModule;

    switch (event.target.value) {
      case 'heading':
        newModule = `
          <label>
            Heading
            <input name="content-h-${ index }" type="text" onblur="input.set.input()">
          </label>
        `;
      break;
      case 'paragraph':
        newModule = `
          <label>
            Paragraph
            <textarea name="content-p-${ index }" onblur="input.set.input()"></textarea>
          </label>
        `;
      break;
      case 'image':
        newModule = `
          <label>
            Image
            <input name="content-i-${ index }" type="file" accept="image/*" onblur="input.set.image.name()">
          </label>
          <input name="content-i-name-${ index }" type="hidden">
        `;
      break;
      case 'list':
        newModule = `
          <label>
            List Name
            <input name="content-l-name-${ index }" type="text" oninput="input.set.list.name()" onblur="input.set.input()">
          </label>
          <label>List items</label>
          <ul>
            <li>
              <input type="text" oninput="input.add.list.item()" onblur="input.set.input()">
            </li>
          </ul>
          <button data-type="addToList" onclick="input.add.list.input()">Add item</button>
          <input name="content-l-list-${ index }" type="hidden">
        `;
      break;
      case 'embed':
        newModule = `
          <label>
            Embedded video (YouTube or Vimeo)
            <input name="content-e-${ index }" type="url" onblur="input.set.input()">
          </label>
        `;
      break;
      case 'button':
        const systemPages = document.querySelector('#systemPages').textContent.split(',');
        let systemPagesString = null;

        // 'page' notation 'id-title'
        systemPages.forEach(page => {
          const pageTitle = page.split('-')[1];

          systemPagesString = `
            ${ systemPagesString }
            <option value="${ page }">
              ${ pageTitle }
            </option>
          `;
        });

        newModule = `
          <label>
            Button name
            <input name="content-b-name-${ index }" type="text" oninput="input.set.button.name()" onblur="input.set.input()">
          </label>
          <label>
            Button link
            <select name="content-b-anchor-${ index }" oninput="input.set.button.anchor()" onblur="input.set.input()">
              <option value="" disabled selected>Select a page</option>
              ${ systemPagesString }
            </select>
          </label>
          <input name="content-b-link-${ index }" type="hidden">
        `;
      break;
    }

    // Insert module at the end of the content list
    pageContent.insertAdjacentHTML(
      'beforeend',
      `<li data-order="${ index }">
        ${ newModule }
        <ul>
          <li><button data-action="move-up" onclick="module.order('up')">up</button></li>
          <li><button data-action="move-down" onclick="module.order('down')">down</button></li>
          <li><button data-action="delete" onclick="module.delete()">delete</button></li>
        </ul>
      </li>`
    );

    // Reset module selector
    event.target.classList.add('hidden');
    event.target.selectedIndex = 0;
  };

  // Delete a module from the page
  const remove = () => {
    const pageContent = document.querySelector('#pageContent');
    const field = event.target.parentNode.parentNode.parentNode;

    pageContent.removeChild(field);
  };

  // Set module order based on given direction
  const order = direction => {
    const pageContent = document.querySelector('#pageContent');
    const fields = pageContent.querySelectorAll('li[data-order]');
    const targetField = event.target.parentNode.parentNode.parentNode;
    const curPos = Number(targetField.getAttribute('data-order'));
    let newPos;
    let newOrder = [];

    // Add content fields to editable array
    fields.forEach(field => {
      newOrder.push(field);
    });

    switch (direction) {
      case 'up':
        // Early exit when module is already in top position
        if (curPos === 0) {
          break;
        }

        // Define new order to be set
        newPos = curPos - 1;

        // Reassign content field orders
        newOrder.forEach(field => {
          const order = Number(field.getAttribute('data-order'));

          if (order === newPos) {
            field.setAttribute('data-order', order + 1);
          } else if (order === curPos) {
            field.setAttribute('data-order', newPos);
          }
        });
      break;
      case 'down':
        // Early exit when module is already in bottom position
        if (curPos === (fields.length - 1)) {
          break;
        }

        // Define new order to be set
        newPos = curPos + 1;

        // Reassign content field orders
        newOrder.forEach(field => {
          const order = Number(field.getAttribute('data-order'));

          if (order === newPos) {
            field.setAttribute('data-order', order - 1);
          } else if (order === curPos) {
            field.setAttribute('data-order', newPos);
          }
        });
      break;
    }

    // Remove all content fields from form
    while (pageContent.children[0]) {
      pageContent.removeChild(pageContent.children[0]);
    }

    // Sort newOrder array
    newOrder.sort((a, b) => {
      return Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order'));
    });

    // Add ordered fields to form
    newOrder.forEach(field => {
      pageContent.insertAdjacentHTML(
        'beforeend',
        field.outerHTML
      );
    });
  };

  // Export functions
  return {
    add: add,
    delete: remove,
    order: order
  };
})();
