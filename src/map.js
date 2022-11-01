/* global L:false */
import async from 'async'
import distance from '@turf/distance'
import Events from 'events'

import josm from './josm'

const modules = [
  josm
]

let map
let config
let data
let assessments
let app

class App extends Events {
  constructor (config) {
    super()
    this.config = config
  }

  init (callback) {
    async.each(
      modules,
      (module, done) => module.init(this, done),
      callback
    )
  }
}

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
          initMap()
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

    app = new App(config)
    app.init(() => {
      initMapKey()
      show()
    })
  })
}

function initMap () {
  map.fitBounds([
    [config.bbox[0], config.bbox[1]],
    [config.bbox[2], config.bbox[3]]
  ])
}

function initMapKey () {
  const mapKey = document.getElementById('map-key')
  mapKey.innerHTML = ''
  for (const text in assessments) {
    const div = document.createElement('div')
    mapKey.appendChild(div)

    const svg = document.createElement('span')
    svg.className = 'icon'
    svg.innerHTML = '<svg width="25" height="25"><circle cx="13" cy="13" r="' + config.treeMarker.radius + '" style="stroke-width: ' + config.treeMarker.weight + 'px; stroke: ' + assessments[text] + '; fill: none;"></svg>'
    div.appendChild(svg)

    let count = null
    if (data) {
      count = data.features.filter(f => f.properties.assessment === text).length
    }

    const span = document.createElement('span')
    span.className = 'text'
    span.appendChild(document.createTextNode(text + (count === null ? null : ' (' + count + ')')))
    div.appendChild(span)
  }
}

let currentLayer
let currentOsm
function show () {
  document.getElementById('details').innerHTML = ''
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
    currentOsm.forEach(l => l.removeFrom(map))
  }

  e.target.setStyle({ fillOpacity: 1 })
  currentLayer = e.target

  const osmFeatures = {
    type: 'FeatureCollection',
    features: feature.properties.osmTrees
  }

  const details = document.getElementById('details')
  const p = {}
  for (const k in feature.properties) {
    if (!['assessment', 'osmTrees', 'SE_ANNO_CAD_DATA'].includes(k)) {
      p[k] = feature.properties[k]
    }
  }

  delete p.assessment
  delete p.osmTrees

  details.innerHTML = ''
  details.appendChild(document.createTextNode(feature.properties.assessment))

  details.appendChild(showTags(p))

  details.appendChild(document.createTextNode('Possible matches:'))

  const ul = document.createElement('ul')
  osmFeatures.features.forEach(f => {
    const li = document.createElement('li')
    const label = document.createElement('a')
    label.href = '#'
    label.className = 'osmTree'
    label.appendChild(document.createTextNode(f.properties['tree:ref'] || '???'))
    label.onclick = () => {
      f.layer.openPopup()
      return false
    }
    li.appendChild(label)

    const a = document.createElement('a')
    a.href = 'https://openstreetmap.org/' + f.properties['@id']
    a.target = '_blank'
    a.innerHTML = ' 🔗'
    li.appendChild(a)

    li.appendChild(document.createTextNode(' (' + (distance(feature, f, { unit: 'kilometers' }) * 1000).toFixed(0) + 'm)'))
    ul.appendChild(li)
  })
  details.appendChild(ul)

  currentOsm = osmFeatures.features.map(
    osmFeature => {
      const layer = L.circleMarker([osmFeature.geometry.coordinates[1], osmFeature.geometry.coordinates[0]], config.osmMarker)
      layer.bindPopup(function () {
        const p = {}
        for (const k in osmFeature.properties) {
          if (!k.match(/^@/)) {
            p[k] = osmFeature.properties[k]
          }
        }
        layer.addTo(map)

        const div = document.createElement('div')
        div.innerHTML = '<a target="_blank" href="https://openstreetmap.org/' + osmFeature.properties['@id'] + '">' + osmFeature.properties['@id'] + '</a>'
        div.appendChild(showTags(p))
        return div
      })
      layer.addTo(map)
      osmFeature.layer = layer
      return layer
    }
  )
}

function showTags (tags) {
  const pre = document.createElement('pre')
  pre.setAttribute('wrap', true)
  pre.appendChild(document.createTextNode(JSON.stringify(tags, null, '  ')))
  return pre
}
