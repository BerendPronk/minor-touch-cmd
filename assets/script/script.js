// Methods for opening and closing modals
const modal = {
  open: () => {
    const box = document.querySelector('section[data-modal="box"]');
    const image = box.querySelector('img');

    // Set clicked image as modal image
    image.src = event.target.src;

    box.classList.remove('hidden');
  },
  close: () => {
    const box = document.querySelector('section[data-modal="box"]');

    box.classList.add('hidden');
  }
};

// Service worker registration
if (navigator.serviceWorker) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.info('Service worker registration succesful'))
      .catch(err => console.error('Service worker registration failed: ', err));
  });
}
