/* global L:false */
let map
let config

window.onload = function () {
  map = L.map('map')

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
    maxZoom: 25
  }).addTo(map)

  fetch('conf.json')
    .then(req => req.json())
    .then(body => {
      config = body
      init()
    })

  fetch('result.geojson')
    .then(req => req.json())
    .then(body => show(body))
}

function init () {
  map.fitBounds([
    [config.bbox[0], config.bbox[1]],
    [config.bbox[2], config.bbox[3]]
  ])
}

const geojsonMarkerOptions = {
  radius: 5,
  color: '#000000',
  weight: 2,
  opacity: 1,
  fillOpacity: 0.0
}

function show (data) {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      const options = JSON.parse(JSON.stringify(geojsonMarkerOptions))
      if (feature.properties.assessment in config.assessmentColors) {
        options.color = config.assessmentColors[feature.properties.assessment]
      }

      return L.circleMarker(latlng, options)
    }
  }).bindPopup(function (layer) {
    return layer.feature.properties.assessment
  }).addTo(map)
}
