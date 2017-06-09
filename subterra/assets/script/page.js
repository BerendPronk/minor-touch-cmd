const pageForm = document.querySelector('form');
let formSubmit = false;

///////////////////////////////////////////////////////
const inputMenu = document.querySelector('input[name="menus"]');
const menuSelect = document.querySelector('#menuSelect');
const pageMenuList = document.querySelector('#pageMenus');
const pageMenus = pageMenuList.querySelectorAll('li');
let menuArr = [];

// Apply page's menus to input, joined with a single comma
pageMenus.forEach(menu => {
  menuArr.push(menu.querySelector('[data-type="menu-title"]').textContent);
});

// Add new menu to page's menus
menuSelect.addEventListener('change', () => {
  // Check if menu is already added
  if (menuArr.indexOf(menuSelect.value) === -1) {
    const newMenu = document.createElement('li');

    newMenu.insertAdjacentHTML(
      'afterbegin',
      `<span data-type="menu-title">${ menuSelect.value }</span>
       <button data-type="menu-delete" onclick="removeMenu()">X</button>`
    );

    // Append new menu to menus list
    pageMenuList.appendChild(newMenu);

    // Add newly added menu to input
    menuArr.push(menuSelect.value);
    inputMenu.value = menuArr.join(',').replace(', ', ',');
  }

  // Reset index of menu selection
  menuSelect.selectedIndex = 0;
});

// Remove a menu from the menu list
function removeMenu() {
  const slug = event.target.parentNode.querySelector('[data-type="menu-title"]').textContent;
  const slugIndex = menuArr.indexOf(slug);

  // Remove menu from menu array
  menuArr.splice(slugIndex, 1);

  // Remove menu from menu list
  pageMenuList.removeChild(pageMenuList.children[slugIndex]);

  // Remove menu from hidden input
  inputMenu.value = menuArr.join(',').replace(', ', ',');
}
///////////////////////////////////////////////////////

const pageContent = document.querySelector('#pageContent');
const moduleButton = document.querySelector('#moduleButton');
const moduleSelect = document.querySelector('#moduleSelect');

// Replace with CSS
moduleButton.addEventListener('click', event => {
  moduleSelect.style.display = 'block';

  event.preventDefault();
});

moduleSelect.addEventListener('input', () => {
  const index = pageContent.children.length;
  let newModule;

  switch (event.target.value) {
    case 'heading':
      newModule = `
        <span class="content-tip">Heading</span>
        <input name="content-h-${ index }" type="text" onblur="setInput()">
      `;
    break;
    case 'paragraph':
      newModule = `
        <span class="content-tip">Paragraph</span>
        <textarea name="content-p-${ index }" onblur="setInput()"></textarea>
      `;
    break;
    case 'image':
      newModule = `
        <span class="content-tip">Image</span>
        <input name="content-i-name-${ index }" type="hidden">
        <input name="content-i-${ index }" type="file" accept="image/*" onblur="setImageName()">
      `;
    break;
    case 'list':
      newModule = `
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
      `;
    break;
    case 'embed':
      newModule = `
        <span class="content-tip">Embedded video (YouTube or Vimeo)</span>
        <input name="content-e-${ index }" type="text" onblur="setInput()">
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
        <span class="content-tip">Button name</span>
        <input name="content-b-name-${ index }" type="text" oninput="setButtonName()">
        <span class="content-tip">Button link</span>
        <input name="content-b-link-${ index }" type="hidden">
        <select name="content-b-anchor-${ index }" oninput="setButtonAnchor()">
          <option value="" disabled selected>Select a page</option>
          ${ systemPagesString }
        </select>
      `;
    break;
  }

  // Insert module at the end of the content list
  pageContent.insertAdjacentHTML(
    'beforeend',
    `<li data-order="${ index }">
      ${ newModule }
      <ul>
        <li><button data-action="move-up" onclick="orderModule('up')">up</button></li>
        <li><button data-action="move-down" onclick="orderModule('down')">down</button></li>
        <li><button data-action="delete" onclick="deleteModule()">delete</button></li>
      </ul>
    </li>`
  );

  // Reset module selector
  moduleSelect.style.display = 'none';
  moduleSelect.selectedIndex = 0;
});

// Set value to input/textarea based on target
function setInput() {
  switch (event.target.nodeName.toLowerCase()) {
    case 'input':
      event.target.setAttribute('value', event.target.value);
      // Unfortunately this doens't work for images, since browsers are unable to receive image path
      // Source: https://stackoverflow.com/questions/4851595/how-to-resolve-the-c-fakepath
    break;
    case 'textarea':
      event.target.textContent = event.target.value;
    break;
  }
}

// Set module order based on given direction
function orderModule(direction) {
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

  event.preventDefault();
}

// Delete a module from the page
function deleteModule() {
  const field = event.target.parentNode.parentNode.parentNode;

  pageContent.removeChild(field);

  event.preventDefault();
}

// Add image name to hidden input field
function setImageName() {
  const field = event.target.parentNode;
  const nameInput = field.querySelector('input[name^="content-i-name"]');

  nameInput.value = event.target.value.replace('C:\\fakepath\\', '');
}

// Add an empty input field to list
function addListInput() {
  const list = event.target.parentNode.querySelector('ul');
  const listIndex = list.children.length;

  list.insertAdjacentHTML(
    'beforeend',
    `<li>
      <input type="text" oninput="addListItem()" onblur="setInput()">
    </li>`
  )

  event.preventDefault();
}

// Add list name input to hidden input field
function addListName() {
  const field = event.target.parentNode;
  const listInput = field.querySelector('input[name^="content-l-list"]');
  const nameValue = event.target.value;
  const list = field.querySelector('ul');
  const listItems = list.querySelectorAll('li');
  let listItemValues = [];

  listItems.forEach(item => {
    const value = item.querySelector('input').value;

    listItemValues.push(value);
  });

  listInput.value = `${ nameValue }|${ listItemValues.join(',') }`;
}

// Add list item input to hidden list input field
function addListItem() {
  const field = event.target.parentNode.parentNode.parentNode;
  const listInput = field.querySelector('input[name^="content-l-list"]');
  const nameValue = field.querySelector('input[name^="content-l-name"]').value;
  const list = field.querySelector('ul');
  const listItems = list.querySelectorAll('li');
  let listItemValues = [];

  listItems.forEach(item => {
    const value = item.querySelector('input').value;

    listItemValues.push(value);
  });

  listInput.value = `${ nameValue }|${ listItemValues.join(',') }`;
}

// Delete item from database
function deleteItem(category, id) {
  if (confirm('Are you sure you want to delete this?') === true) {
    window.location = `/subterra/${ category }/delete/${ id }`;
  }
}

// Add button name to hidden input field
function setButtonName() {
  const field = event.target.parentNode;
  const buttonName = event.target.value;
  const buttonAnchor = field.querySelector('select[name^="content-b-anchor"]').value;
  const buttonInput = field.querySelector('input[name^="content-b-link"]');

  if (buttonAnchor.value) {
    buttonInput.value = `${ buttonName }|${ buttonAnchor }`;
  } else {
    buttonInput.value = `${ buttonName }|`;
  }
}

// Add button anchor to hidden input field
function setButtonAnchor() {
  const field = event.target.parentNode;
  const buttonName = field.querySelector('input[name^="content-b-name"]').value;
  const buttonAnchor = event.target.value;
  const buttonInput = field.querySelector('input[name^="content-b-link"]');

  buttonInput.value = `${ buttonName }|${ buttonAnchor }`;
}

// Set formSubmit to active
pageForm.addEventListener('submit', () => {
  formSubmit = true;
});

// Hide/show an element
function toggleShow(element) {
  const toToggle = document.querySelector(element);

  if (toToggle.classList.contains('hidden')) {
    toToggle.classList.remove('hidden');
  } else {
    toToggle.classList.add('hidden');
  }
}

// Alert user before page unload to prevent data loss
// window.onbeforeunload = () => {
//   if (!formSubmit) {
//     return 'You may have some unsaved changes, do you really want to leave this page?';
//   } else {
//     return;
//   }
// };
