/* global L:false */
import async from 'async'
let map
let config
let data
let assessments

window.onload = function () {
  map = L.map('map')

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
    maxZoom: 25
  }).addTo(map)

  async.parallel([
    (done) =>
      fetch('conf.json')
        .then(req => req.json())
        .then(body => {
          config = body
          done()
        }),
    (done) =>
      fetch('assessments.json')
        .then(req => req.json())
        .then(body => {
          assessments = body
          done()
        }),
    (done) =>
      fetch('data/result.geojson')
        .then(req => req.json())
        .then(body => {
          data = body
          done()
        })
  ], (err) => {
    if (err) {
      global.alert(err)
    }

    init()
    show()
  })
}

function init () {
  map.fitBounds([
    [config.bbox[0], config.bbox[1]],
    [config.bbox[2], config.bbox[3]]
  ])

  const mapKey = document.getElementById('map-key')
  for (const text in assessments) {
    const div = document.createElement('div')
    mapKey.appendChild(div)

    const svg = document.createElement('span')
    svg.className = 'icon'
    svg.innerHTML = '<svg width="25" height="25"><circle cx="13" cy="13" r="' + config.treeMarker.radius + '" style="stroke-width: ' + config.treeMarker.weight + 'px; stroke: ' + assessments[text] + '; fill: none;"></svg>'
    div.appendChild(svg)

    const span = document.createElement('span')
    span.className = 'text'
    span.appendChild(document.createTextNode(text))
    div.appendChild(span)
  }
}

let currentLayer
let currentOsm
function show () {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      const options = JSON.parse(JSON.stringify(config.treeMarker))
      if (feature.properties.assessment in assessments) {
        options.color = assessments[feature.properties.assessment]
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

  const details = document.getElementById('details')
  const p = JSON.parse(JSON.stringify(feature.properties))
  delete p.assessment
  delete p.osmTrees
  details.innerHTML = feature.properties.assessment +
    '<pre wrap>' + JSON.stringify(p, null, '  ') + '</pre>'

  currentOsm = L.geoJSON(osmFeatures, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, config.osmMarker)
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
