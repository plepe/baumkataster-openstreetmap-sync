/* global L:false */
let map
let config

const geojsonMarkerOptions = {
  radius: 5,
  color: '#000000',
  weight: 2,
  opacity: 1,
  fillOpacity: 0.0
}
const osmMarkerOptions = {
  radius: 4,
  color: '#ff00ff',
  weight: 0,
  fillOpacity: 1.0
}

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

  const mapKey = document.getElementById('map-key')
  for (const text in config.assessmentColors) {
    const div = document.createElement('div')
    mapKey.appendChild(div)

    const svg = document.createElement('span')
    svg.className = 'icon'
    svg.innerHTML = '<svg width="25" height="25"><circle cx="13" cy="13" r="' + geojsonMarkerOptions.radius + '" style="stroke-width: ' + geojsonMarkerOptions.weight + 'px; stroke: ' + config.assessmentColors[text] + '; fill: none;"></svg>'
    div.appendChild(svg)

    const span = document.createElement('span')
    span.className = 'text'
    span.appendChild(document.createTextNode(text))
    div.appendChild(span)
  }
}

let currentLayer
let currentOsm
function show (data) {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      const options = JSON.parse(JSON.stringify(geojsonMarkerOptions))
      if (feature.properties.assessment in config.assessmentColors) {
        options.color = config.assessmentColors[feature.properties.assessment]
      }

      return L.circleMarker(latlng, options)
    },
    onEachFeature: function (feature, layer) {
      layer.on({
        click: showTree
      })
    }
  }).addTo(map)
}

function showTree (e) {
  const feature = e.target.feature

  if (currentLayer) {
    currentLayer.setStyle({ fillOpacity: 0 })
  }
  if (currentOsm) {
    currentOsm.removeFrom(map)
  }

  e.target.setStyle({ fillOpacity: 1 })
  currentLayer = e.target

  const osmFeatures = {
    type: 'FeatureCollection',
    features: feature.properties.osmTrees
  }

  currentOsm = L.geoJSON(osmFeatures, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, osmMarkerOptions)
    }
  }).bindPopup (function (osmTree) {
    const p = {}
    for (let k in osmTree.feature.properties) {
      if (!k.match(/^@/)) {
        p[k] = osmTree.feature.properties[k]
      }
    }

    return '<a target="_blank" href="https://openstreetmap.org/' + osmTree.feature.properties['@id'] + '">' + osmTree.feature.properties['@id'] + '</a><br>' +
      '<pre>' + JSON.stringify(p, null, '  ') + '</pre>'
  }).addTo(map)
}
