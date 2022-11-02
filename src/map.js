/* global L:false */
let app

export const map = {
  init (_app, callback) {
    app = _app

    map.map = L.map('map')

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxNativeZoom: 19,
      maxZoom: 25
    }).addTo(map.map)

    map.map.fitBounds([
      [app.config.bbox[0], app.config.bbox[1]],
      [app.config.bbox[2], app.config.bbox[3]]
    ])

    callback()
  }
}
