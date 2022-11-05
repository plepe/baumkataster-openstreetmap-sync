import distance from '@turf/distance'

import { PropertiesCmp } from './PropertiesCmp'
import { baumkatasterWien } from '../dataset/baumkataster-wien'
import osmMarker from './osmMarker.json'

let currentLayer
let currentOsm
let tableInfo, tableProp, tableOSM
let app

export function showTree (_app, feature, layer, convertedTags) {
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

  document.body.className = 'details'
  const details = document.getElementById('details')
  details.innerHTML = ''

  const closeButton = document.createElement('div')
  closeButton.className = 'closeButton'
  closeButton.innerHTML = '⏴ back'
  closeButton.onclick = () => {
    document.body.className = 'main'

    clearOsm()
    if (currentLayer) {
      currentLayer.setStyle({ fillOpacity: 0 })
      currentLayer = null
    }
  }
  details.appendChild(closeButton)

  const p = {}
  for (const k in feature.properties) {
    if (!['assessment', 'osmTrees', 'SE_ANNO_CAD_DATA'].includes(k)) {
      p[k] = feature.properties[k]
    }
  }

  delete p.assessment
  delete p.osmTrees

  details.appendChild(document.createTextNode('Assessment: ' + (feature.properties.assessment || 'not assessed (yet)')))

  tableInfo = new PropertiesCmp(baumkatasterWien.infoFields)
  tableProp = new PropertiesCmp(baumkatasterWien.propFields)
  tableOSM = new PropertiesCmp(baumkatasterWien.osmFields)
  details.appendChild(tableInfo.init())
  details.appendChild(document.createTextNode('Properties:'))
  details.appendChild(tableProp.init())
  details.appendChild(document.createTextNode('Further OSM properties:'))
  details.appendChild(tableOSM.init())

  tableInfo.setHeader('Baumkataster', 'kat')
  tableInfo.show(feature.properties, 'kat')
  tableProp.show(feature.properties, 'kat')
  tableOSM.show(convertedTags, 'kat')

  app.emit('tree-show', {
    katasterTree: feature
  })

  const select = document.createElement('select')
  select.onchange = () => {
    highlightOsm(feature, osmFeatures.features[select.value])
  }
  if (osmFeatures && osmFeatures.features && osmFeatures.features.length) {
    osmFeatures.features.forEach((osmFeature, i) => {
      const _distance = distance(feature, osmFeature, { unit: 'kilometers' }) * 1000
      osmFeature.properties['@distance'] = _distance

      const option = document.createElement('option')
      option.value = i
      option.appendChild(document.createTextNode(osmFeature.properties['@id'] + ' (' + _distance.toFixed(0) + 'm)'))
      select.appendChild(option)
    })

    const span = document.createElement('span')
    span.innerHTML = 'Possible OSM:<br>'
    span.appendChild(select)

    tableInfo.setHeader(span, 'osm')
    highlightOsm(feature, osmFeatures.features[0], convertedTags)
  }
}

function highlightOsm (katFeature, osmFeature, convertedTags) {
  tableInfo.show(osmFeature.properties, 'osm')
  tableProp.show(osmFeature.properties, 'osm')
  tableOSM.show(osmFeature.properties, 'osm')
  tableProp.compare(katFeature.properties, osmFeature.properties)
  tableOSM.compare(convertedTags, osmFeature.properties)

  clearOsm()

  const layer = L.circleMarker([osmFeature.geometry.coordinates[1], osmFeature.geometry.coordinates[0]], osmMarker)
  currentOsm.push(layer)
  layer.addTo(app.map)
  osmFeature.layer = layer

  app.emit('tree-show', {
    katasterTree: katFeature,
    osmTree: osmFeature
  })

  return layer
}

function clearOsm () {
  if (currentOsm) {
    currentOsm.forEach(l => l.removeFrom(app.map))
  }
  currentOsm = []

  app.emit('tree-hide')
}
