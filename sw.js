// Configure service worker
var swConfig = {
    genCache: 'curriculum-cache-v1',
    pageCache: 'touchcmd-page-cache-v1',
    urls: [
      '/offline/',
      '/assets/script/script.js',
      '/assets/style/style.css'
    ]
};

// Installment of service worker
self.addEventListener('install', event => event.waitUntil(
  caches.open(swConfig.genCache)
    .then(cache => cache.addAll(swConfig.urls))
      .then(self.skipWaiting())
));

// Handle fetching of requests
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => cachePage(request, response))
        .catch(err => getCachedPage(request))
        .catch(err => fetchCoreFile('/offline/'))
    );
  } else {
    event.respondWith(
      fetch(request)
        .catch(err => fetchCoreFile(request.url))
        .catch(err => fetchCoreFile('/offline/'))
    );
  }
});

// Fetch core file, either requested page or the offline page
function fetchCoreFile(url) {
  return caches.open(swConfig.genCache)
    .then(cache => cache.match(url))
    .then(response => response ? response : Promise.reject());
}

// Retrieve cached page
function getCachedPage(request) {
  return caches.open(swConfig.pageCache)
    .then(cache => cache.match(request))
    .then(response => response ? response : Promise.reject());
}

// Cache data on page
function cachePage(request, response) {
    const clonedResponse = response.clone();

    caches.open(swConfig.pageCache)
      .then(cache => cache.put(request, clonedResponse));

    return response;
}
