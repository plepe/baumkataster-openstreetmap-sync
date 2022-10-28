import fs from 'fs'
import OverpassFrontend from 'overpass-frontend'
import async from 'async'
const overpassFrontend = new OverpassFrontend('openstreetmap.json')

const bbox = [ 48.16821, 16.31701, 48.17324, 16.32580 ]
const searchDistance = 10
const lastImportYear = 2012

let data = fs.readFileSync('baumkataster.json')
data = JSON.parse(data)

data = data.features.filter(function (tree) {
  const coord = tree.geometry.coordinates
  return (coord[0] >= bbox[1] && coord[0] <= bbox[3] && coord[1] >= bbox[0] && coord[1] <= bbox[2])
})

let x = 0

async.map(data, function (katTree, callback) {
  const osmTrees = []
  const coord = katTree.geometry.coordinates
  const query = 'node[natural=tree](around:' + searchDistance + ',' + coord[1] + ',' + coord[0] + ')'
  overpassFrontend.BBoxQuery(
    query,
    null,
    {},
    function (err, osmTree) {
      osmTrees.push(osmTree)
    },
    function (err) {
      const result = assessTree(katTree, osmTrees)

      katTree.properties.assessment = result.text
      katTree.properties.osmTrees = result.trees.map(t => t.GeoJSON())

      callback(null, katTree)
    }
  )
},
(err, results) => {
  console.log(results.map(katTree => katTree.properties.assessment).join('\n'))

  const result = { type: 'FeatureCollection', features: results }
  fs.writeFile('result.geojson', JSON.stringify(result, null, '  '), () => {})
})


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

    if (matchingTreesWithoutNR.length > 1) {
      return {
        text: 'non-matching trees found',
        trees: matchingTreesWithoutNR
      }
    }
    else if (matchingTreesWithoutNR.length === 1) {
      return {
        text: 'non-matching tree found',
        trees: matchingTreesWithoutNR
      }
    }

    return {
      text: 'no matching trees found',
      trees: []
    }
  }

  const osmTree = matchingTrees[0]
  if (osmTree.tags['start_date'] != katTree.properties.PFLANZJAHR) {
    if (katTree.properties.PFLANZJAHR >= lastImportYear) {
      return {
        text: 'tree found, replaced',
        trees: [osmTree]
      }
    }

    if (katTree.properties.PFLANZJAHR == 0) {
      return {
        text: 'tree found, logged',
        trees: [osmTree]
      }
    }

    return {
      text: 'tree found, but different start_date',
      trees: [osmTree]
    }
  }

  return {
    text: 'tree found',
    trees: [osmTree]
  }
}
