/* global L:false */
let app

export const map = {
  init (_app, callback) {
    app = _app

    app.map = L.map('map')

    const layers = {}

    layers['OSM Mapnik'] = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxNativeZoom: 19,
      maxZoom: 25
    })

    layers['Basemap'] = L.tileLayer("http://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png", {
      subdomains : ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
      attribution: '&copy; <a href="http://basemap.at">Basemap.at</a>',
      maxNativeZoom: 20,
      maxZoom: 25
    })

    layers['Basemap Orthofoto'] = L.tileLayer("http://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg", {
      subdomains : ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
      attribution: '&copy; <a href="http://basemap.at">Basemap.at</a>',
      maxNativeZoom: 20,
      maxZoom: 25
    })

    layers['OSM Mapnik'].addTo(app.map)
    L.control.layers(layers).addTo(app.map)

    app.map.attributionControl.setPrefix('<a target="_blank" href="https://github.com/plepe/baumkataster-openstreetmap-sync">baumkataster-openstreetmap-sync</a>')

    app.map.fitBounds([
      [app.config.bbox[0], app.config.bbox[1]],
      [app.config.bbox[2], app.config.bbox[3]]
    ])

    callback()
  }
}
