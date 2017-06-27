// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.info('ServiceWorker registration succesful'))
      .catch(err => console.error('ServiceWorker registration failed: ', err));
  });
}
