import fs from 'fs'
import OverpassFrontend from 'overpass-frontend'
import async from 'async'
import distance from '@turf/distance'
import { assessTree } from './src/assessTree.js'

const config = JSON.parse(fs.readFileSync('conf.json'))

const app = {
  config
}
const modules = [
  assessTree
]

let overpassFrontend
let data

function loadOSM (callback) {
  console.error('loading OSM data')
  overpassFrontend = new OverpassFrontend('data/openstreetmap.json')
  overpassFrontend.once('load', () => {
    console.error('finished loading OSM data')
    callback()
  })
}

function loadBK (callback) {
  console.error('loading baumkataster')
  fs.readFile('data/baumkataster.geojson', (err, _data) => {
    if (err) {
      console.error('error loading baumkataster', err)
      return callback(err)
    }

    data = JSON.parse(_data)
    console.error('finished loading baumkataster')
    callback(null)
  })
}

async.parallel([
  loadOSM,
  loadBK,
  done => async.each(
    modules,
    (module, done) => module.init(app, done),
    (err) => {
      if (err) { return global.alert(err) }
      done(err)
    }
  )
], (err) => {
  if (err) { return }

  filterBBox()
  assess()
})

function filterBBox () {
  data.features = data.features.filter(function (tree) {
    const coord = tree.geometry.coordinates
    return (coord[0] >= config.bbox[1] && coord[0] <= config.bbox[3] && coord[1] >= config.bbox[0] && coord[1] <= config.bbox[2])
  })
}

function assess () {
  async.mapLimit(data.features, config.assessParallel || 1, function (katTree, callback) {
    const osmTrees = []
    const coord = katTree.geometry.coordinates
    const query = 'node[natural=tree](around:' + config.searchDistance + ',' + coord[1] + ',' + coord[0] + ')'
    overpassFrontend.BBoxQuery(
      query,
      null,
      {},
      function (err, osmTree) {
        if (err) { return console.error(err) }
        osmTrees.push(osmTree.GeoJSON())
      },
      function (err) {
        if (err) { callback(err) }

        const result = assessTree(katTree, osmTrees)

        katTree.properties.assessment = result.text
        katTree.properties.osmTrees = result.trees
        console.log(katTree.properties.OBJECTID + ': ' + result.text)

        callback(null, katTree)
      }
    )
  },
  (err, results) => {
    if (err) {
      return console.error(err)
    }

    const result = { type: 'FeatureCollection', features: results }
    fs.writeFile('data/result.geojson', JSON.stringify(result, null, '  '), () => {})
  })
}


