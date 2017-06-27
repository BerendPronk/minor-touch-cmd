// // Geolocation bounding box of the Theo Thijssenhuis university building
// const lounge = {
//   nw: {
//     lat: 52.35909395557715,
//     long: 4.907342791557312
//   },
//   ne: {
//     lat: 52.35928396939051,
//     long: 4.908190369606018
//   },
//   se: {
//     lat: 52.35913654495119,
//     long: 4.9081796407699585
//   },
//   sw: {
//     lat: 52.35895635885742,
//     long: 4.907428622245789
//   },
// };
//
// if (navigator.geolocation) {
//   navigator.geolocation.watchPosition(showPosition);
// } else {
//   console.error('Geolocation is not supported by your browser.');
// }
//
// function showPosition(position) {
//   if (position.coords.latitude >= lounge.sw.lat && position.coords.latitude <= lounge.ne.lat && position.coords.longitude >= lounge.nw.long && position.coords.longitude <= lounge.se.long) {
//     console.log('Your device is located in the Theo Thijssenhuis building.');
//   } else {
//     console.log('You are somewhere else.');
//   }
// }

// Check if tv-mode is active and if current page is not the homepage
if (document.body.classList.contains('tv') && !document.body.classList.contains('index')) {
  // Wait 90 seconds
  setTimeout(() => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<p data-type="tooltip" class="invisible">
        Keer terug naar home<br>
        voor een verse ervaring!
      </p>`
    );

    // Remove class in order to animate the element
    document.querySelector('p[data-type="tooltip"]').classList.remove('invisible');
  }, 90000);
}

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
