import fs from 'fs'
import OverpassFrontend from 'overpass-frontend'
import async from 'async'
import distance from '@turf/distance'

const config = JSON.parse(fs.readFileSync('conf.json'))

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
  loadBK
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
        osmTrees.push(osmTree)
      },
      function (err) {
        if (err) { callback(err) }

        const result = assessTree(katTree, osmTrees)

        katTree.properties.assessment = result.text
        katTree.properties.osmTrees = result.trees
          .map(t => t.GeoJSON())
          .sort((a, b) => distance(katTree, a) - distance(katTree, b))
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

function assessTree (katTree, osmTrees) {
  const matchingTrees = osmTrees.filter(osmTree => {
    return osmTree.tags['tree:ref'] === katTree.properties.BAUMNUMMER
  })

  if (matchingTrees.length > 1) {
    return {
      text: 'several trees with same BAUMNUMMER found',
      trees: matchingTrees
    }
  }

  if (matchingTrees.length === 0) {
    const matchingTreesWithoutNR = osmTrees.filter(osmTree => {
      return !('tree:ref' in osmTree.tags)
    })

    if (matchingTreesWithoutNR.length) {
      return {
        text: 'trees without NUMMER found',
        trees: matchingTreesWithoutNR
      }
    }

    if (osmTrees.length) {
      return {
        text: 'trees with different NUMMER found',
        trees: osmTrees
      }
    }

    return {
      text: 'no trees found',
      trees: []
    }
  }

  const osmTree = matchingTrees[0]
  const convertedTags = convertBk2OSM(katTree.properties)

  if (parseInt(osmTree.tags.start_date) !== katTree.properties.PFLANZJAHR) {
    if (katTree.properties.PFLANZJAHR >= config.lastImportYear) {
      return {
        text: 'tree found, replaced',
        trees: [osmTree]
      }
    }

    if (katTree.properties.GATTUNG_ART === 'Jungbaum wird gepflanzt') {
      return {
        text: 'tree found, being replaced',
        trees: [osmTree]
      }
    }

    if (katTree.properties.PFLANZJAHR !== 0 || 'start_date' in osmTree.tags) {
      return {
        text: 'tree found, but different start_date',
        trees: [osmTree]
      }
    }
  }

  if (osmTree.tags.species !== convertedTags.species) {
    return {
      text: 'tree found, species different',
      trees: [osmTree]
    }
  }

  return {
    text: 'tree found',
    trees: [osmTree]
  }
}

function convertBk2OSM (properties) {
  const tags = {
    denotation: 'urban',
    natural: 'tree'
  }

  tags['tree:ref'] = properties.BAUMNUMMER
  tags['start_date'] = properties.PFLANZJAHR

  if (properties.GATTUNG_ART === 'Jungbaum wird gepflanzt') {
    tags['species'] = 'none'
  } else {
    const m = properties.GATTUNG_ART.match(/^([^']+) ('(.*)' )?\((.*)\)$/)
    if (m) {
      tags['taxon'] = m[1]
      tags['species'] = m[1]
      tags['species:de'] = m[4]

      if (m[2]) {
        tags['taxon'] = m[1] + ' ' + m[3]
        tags['taxon:cultivar'] = m[3]
      }
    } else {
      console.error("Can't parse GATTUNG_ART", properties.GATTUNG_ART)
    }
  }

  return tags
}
