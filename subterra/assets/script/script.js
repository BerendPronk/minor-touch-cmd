// Add selected option as a new selection list item
function addSelectList(option) {
  const formInput = document.querySelector(`input[name="${ option }"]`);
  const formSelect = event.target;
  const optionList = event.target.parentNode.parentNode.querySelector('ul');
  const optionListItems = optionList.querySelectorAll('li');
  const currentItems = formInput.value.split(',').filter(e => {
    // Removes empty data fields
    return e;
  });

  // Check if option has already been added
  if (currentItems.indexOf(formSelect.value) === -1) {
    const newItem = document.createElement('li');

    newItem.insertAdjacentHTML(
      'afterbegin',
      `<span data-type="${ option }-name">${ formSelect.value }</span>
      <button data-type="${ option }-delete" onclick="removeSelectList('${ option }')">X</button>`
    );

    // Append new option to DOM list
    optionList.appendChild(newItem);

    // Add newly added option to input
    currentItems.push(formSelect.value);

    if (currentItems.length === 1) {
      formInput.value = formSelect.value;
    } else {
      formInput.value = currentItems.join(',').replace(', ', ',');
    }
  }

  // Reset index of selection element
  formSelect.selectedIndex = 0;
}

// Remove an option from the selection list items
function removeSelectList(option) {
  const field = event.target.parentNode.parentNode.parentNode;
  const formInput = field.querySelector(`input[name="${ option }"]`);
  const optionList = field.querySelector(`ul`);
  const currentItems = formInput.value.split(',');

  const content = event.target.parentNode.querySelector(`[data-type="${ option }-name"]`).textContent;
  const contentIndex = currentItems.indexOf(content);

  // Remove option from input values
  currentItems.splice(contentIndex, 1);

  // Remove option from DOM list
  optionList.removeChild(optionList.children[contentIndex]);

  // Remove option from hidden input
  formInput.value = currentItems.join(',').replace(', ', ',');
}

// Add an empty module to the page content fields
function addModule() {
  const pageContent = document.querySelector('#pageContent');
  const index = pageContent.children.length;
  let newModule;

  switch (event.target.value) {
    case 'heading':
      newModule = `
        <label>
          Heading
          <input name="content-h-${ index }" type="text" onblur="setInput()">
        </label>
      `;
    break;
    case 'paragraph':
      newModule = `
        <label>
          Paragraph
          <textarea name="content-p-${ index }" onblur="setInput()"></textarea>
        </label>
      `;
    break;
    case 'image':
      newModule = `
        <label>
          Image
          <input name="content-i-${ index }" type="file" accept="image/*" onblur="setImageName()">
        </label>
        <input name="content-i-name-${ index }" type="hidden">
      `;
    break;
    case 'list':
      newModule = `
        <label>
          List Name
          <input name="content-l-name-${ index }" type="text" oninput="setListName()" onblur="setInput()">
        </label>
        <label>List items</label>
        <ul>
          <li>
            <input type="text" oninput="addListItem()" onblur="setInput()">
          </li>
        </ul>
        <button data-type="addToList" onclick="addListInput()">Add item</button>
        <input name="content-l-list-${ index }" type="hidden">
      `;
    break;
    case 'embed':
      newModule = `
        <label>
          Embedded video (YouTube or Vimeo)
          <input name="content-e-${ index }" type="url" onblur="setInput()">
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
          <input name="content-b-name-${ index }" type="text" oninput="setButtonName()" onblur="setInput()">
        </label>
        <label>
          Button link
          <select name="content-b-anchor-${ index }" oninput="setButtonAnchor()" onblur="setInput()">
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
        <li><button data-action="move-up" onclick="orderModule('up')">up</button></li>
        <li><button data-action="move-down" onclick="orderModule('down')">down</button></li>
        <li><button data-action="delete" onclick="deleteModule()">delete</button></li>
      </ul>
    </li>`
  );

  // Reset module selector
  event.target.classList.add('hidden');
  event.target.selectedIndex = 0;
}

// Set module order based on given direction
function orderModule(direction) {
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
}

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
    case 'select':
      event.target.setAttribute('value', event.target.value);

      event.target.querySelectorAll('option').forEach(option => {
        if (option.value === event.target.value) {
          option.setAttribute('selected', true);
        }
      })
    break;
  }
}

// Delete a module from the page
function deleteModule() {
  const pageContent = document.querySelector('#pageContent');
  const field = event.target.parentNode.parentNode.parentNode;

  pageContent.removeChild(field);
}

// Add image name to hidden input field
function setImageName() {
  const field = event.target.parentNode.parentNode;
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
  );

  event.preventDefault();
}

// Add list name input to hidden input field
function setListName() {
  const field = event.target.parentNode.parentNode;
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
  const field = event.target.parentNode.parentNode;
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
  const field = event.target.parentNode.parentNode;
  const buttonName = field.querySelector('input[name^="content-b-name"]').value;
  const buttonAnchor = event.target.value;
  const buttonInput = field.querySelector('input[name^="content-b-link"]');

  buttonInput.value = `${ buttonName }|${ buttonAnchor }`;
}

// Hide/show an element
function toggleShow(element) {
  const toToggle = document.querySelector(element);

  toToggle.classList.toggle('hidden');

  event.preventDefault();
}

let formSubmit = false;
const disabledPaths = [
  '/subterra',
  '/subterra/login',
  '/subterra/search/',
  '/subterra/types',
  '/subterra/menus',
  '/subterra/pages',
  '/subterra/portfolio',
  '/subterra/faq'
];

// Set formSubmit to active
function submitForm() {
  formSubmit = true;
}

if (disabledPaths.indexOf(location.pathname) === -1) {
  // Alert user before page unload to prevent data loss
  window.onbeforeunload = () => {
    if (!formSubmit) {
      return 'You may have some unsaved changes, do you really want to leave this page?';
    } else {
      return;
    }
  };
}
