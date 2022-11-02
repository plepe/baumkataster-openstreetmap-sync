import { convertKataster2OSM } from './convertKataster2OSM.js'

let app

export function assessTree (katTree, osmTrees) {
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
  const convertedTags = convertKataster2OSM(katTree.properties)

  if (parseInt(osmTree.tags.start_date) !== katTree.properties.PFLANZJAHR) {
    if (katTree.properties.PFLANZJAHR >= app.config.lastImportYear) {
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

  if (osmTree.tags.circumference !== convertedTags.circumference ||
      osmTree.tags.diameter_crown !== convertedTags.diameter_crown ||
      osmTree.tags.height !== convertedTags.height) {
    return {
      text: 'tree found, changed values',
      trees: [osmTree]
    }
  }

  return {
    text: 'tree found',
    trees: [osmTree]
  }
}

assessTree.init = (_app, callback) => {
  app = _app
  callback()
}
