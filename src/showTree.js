import distance from '@turf/distance'

import { map } from './map'
import { PropertiesCmp } from './PropertiesCmp'

let currentLayer
let currentOsm
let table
let app

export function showTree (_app, feature, layer) {
  app = _app

  clearOsm()
  if (currentLayer) {
    currentLayer.setStyle({ fillOpacity: 0 })
  }

  layer.setStyle({ fillOpacity: 1 })
  currentLayer = layer

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

  table = new PropertiesCmp()
  details.appendChild(table.init())

  table.show(feature.properties, 'kat')

  const select = document.createElement('select')
  select.onchange = () => {
    highlightOsm(osmFeatures.features[select.value])
  }
  if (osmFeatures.features.length) {
    osmFeatures.features.forEach((osmFeature, i) => {
      const _distance = distance(feature, osmFeature, { unit: 'kilometers' }) * 1000
      osmFeature.properties['@distance'] = _distance

      const option = document.createElement('option')
      option.value = i
      option.appendChild(document.createTextNode(osmFeature.properties['@id'] + ' (' + _distance.toFixed(0) + 'm)'))
      select.appendChild(option)
    })

    table.setHeader(select, 'osm')
    highlightOsm(osmFeatures.features[0])
  }
}

function highlightOsm (osmFeature) {
  table.show(osmFeature.properties, 'osm')

  clearOsm()

  const layer = L.circleMarker([osmFeature.geometry.coordinates[1], osmFeature.geometry.coordinates[0]], app.config.osmMarker)
  currentOsm.push(layer)
  layer.bindPopup(function () {
    const p = {}
    for (const k in osmFeature.properties) {
      if (!k.match(/^@/)) {
        p[k] = osmFeature.properties[k]
      }
    }
    layer.addTo(map.map)

    const div = document.createElement('div')
    div.innerHTML = '<a target="_blank" href="https://openstreetmap.org/' + osmFeature.properties['@id'] + '">' + osmFeature.properties['@id'] + '</a>'
    div.appendChild(showTags(p))

    app.emit('osm-popup', {
      katasterTree: feature,
      osmTree: osmFeature,
      popup: div
    })

    return div
  })
  layer.addTo(map.map)
  osmFeature.layer = layer
  return layer
}

function showTags (tags) {
  const pre = document.createElement('pre')
  pre.setAttribute('wrap', true)
  pre.appendChild(document.createTextNode(JSON.stringify(tags, null, '  ')))
  return pre
}

function clearOsm () {
  if (currentOsm) {
    currentOsm.forEach(l => l.removeFrom(map.map))
  }
  currentOsm = []
}
