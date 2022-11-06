import distance from '@turf/distance'

import { convertKataster2OSM } from './convertKataster2OSM.js'
import { tagCmp } from './tagCmp.js'

let app

export function assessTree (katTree, osmTrees, callback) {
  osmTrees = osmTrees
    .sort((a, b) => distance(katTree, a) - distance(katTree, b))

  const matchingTrees = osmTrees.filter(osmTree => {
    return osmTree.properties['tree:ref'] === katTree.properties.BAUMNUMMER
  })

  if (matchingTrees.length > 1) {
    const matchingTreeIds = matchingTrees.map(t => t.id)
    return callback(null, {
      text: 'several trees with same BAUMNUMMER found',
      trees: matchingTrees.concat(osmTrees.filter(t => !matchingTreeIds.includes(t.id)))
    })
  }

  if (matchingTrees.length === 0) {
    const matchingTreesWithoutNR = osmTrees.filter(osmTree => {
      return !('tree:ref' in osmTree.properties)
    })

    if (matchingTreesWithoutNR.length) {
      const matchingTreeIds = matchingTreesWithoutNR.map(t => t.id)
      return callback(null, {
        text: 'trees without NUMMER found',
        trees: matchingTreesWithoutNR.concat(osmTrees.filter(t => !matchingTreeIds.includes(t.id)))
      })
    }

    if (osmTrees.length) {
      return callback(null, {
        text: 'trees with different NUMMER found',
        trees: osmTrees
      })
    }

    return callback(null, {
      text: 'no trees found',
      trees: []
    })
  }

  const osmTree = matchingTrees[0]
  const matchingTreeIds = matchingTrees.map(t => t.id)
  const trees = matchingTrees.concat(osmTrees.filter(t => !matchingTreeIds.includes(t.id)))

  if (parseInt(osmTree.properties.start_date) !== katTree.properties.PFLANZJAHR) {
    if (katTree.properties.PFLANZJAHR >= app.config.lastImportYear) {
      return callback(null, {
        text: 'tree found, replaced',
        trees
      })
    }

    if (katTree.properties.GATTUNG_ART === 'Jungbaum wird gepflanzt') {
      if (osmTree.properties.species === 'none') {
        return callback(null, {
          text: 'tree found',
          trees
        })
      }

      return callback(null, {
        text: 'tree found, being replaced',
        trees
      })
    }

    if (katTree.properties.PFLANZJAHR !== 0 || 'start_date' in osmTree.properties) {
      return callback(null, {
        text: 'tree found, but different start_date',
        trees
      })
    }
  }

  convertKataster2OSM(katTree.properties, (err, convertedTags) => {
    if (err) { return callback(err) }

    if (osmTree.properties.species !== convertedTags.species) {
      return callback(null, {
        text: 'tree found, species different',
        trees
      })
    }

    if (!tagCmp(osmTree.properties.circumference, convertedTags.circumference) ||
        !tagCmp(osmTree.properties.diameter_crown, convertedTags.diameter_crown) ||
        !tagCmp(osmTree.properties.height, convertedTags.height)) {
      return callback(null, {
        text: 'tree found, changed values',
        trees
      })
    }

    return callback(null, {
      text: 'tree found',
      trees
    })
  })
}

assessTree.init = (_app, callback) => {
  app = _app
  callback()
}
