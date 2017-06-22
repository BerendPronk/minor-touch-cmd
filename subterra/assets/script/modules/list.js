// Subterra list related functions
const list = (() => {

  // Add selected option as a new selection list item
  const add = option => {
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
        <button data-type="${ option }-delete" onclick="list.delete('${ option }')">X</button>`
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
  };

  // Remove an option from the selection list items
  const remove = option => {
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
  };

  // Export functions
  return {
    add: add,
    delete: remove
  };
})();
