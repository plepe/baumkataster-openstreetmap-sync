import OverpassFrontend from 'overpass-frontend'
import { showTree } from './showTree'
import assessments from './assessments.json'
import { assessTree } from './assessTree.js'

let app

export class Tree {
  constructor (feature) {
    this.feature = feature
  }

  show () {
    const options = JSON.parse(JSON.stringify(app.config.treeMarker))
    if (this.assessment in assessments) {
      options.color = assessments[this.assessment]
    }

    if (this.layer) {
      this.layer.setStyle(options)
      return
    }

    this.layer = L.circleMarker([this.feature.geometry.coordinates[1], this.feature.geometry.coordinates[0]], options)
    this.layer.addTo(app.map)
    this.layer.on({
      click: (e) => {
        this.feature.properties.osmTrees = this.osmTrees // TODO: remove
        this.feature.properties.assessment = this.assessment // TODO: remove
        showTree(app, this.feature, this.layer)
      }
    })
  }

  loadNearbyOSMTrees (callback) {
    if (this.osmTrees) {
      return callback(null, this.osmTrees)
    }

    const osmTrees = []
    const coord = this.feature.geometry.coordinates
    const query = 'node[natural=tree](around:' + app.config.searchDistance + ',' + coord[1] + ',' + coord[0] + ')'
    app.overpassFrontend.BBoxQuery(
      query,
      null,
      {
        properties: OverpassFrontend.TAGS | OverpassFrontend.GEOM
      },
      (err, osmTree) => {
        if (err) { return console.error(err) }
        osmTrees.push(osmTree.GeoJSON())
      },
      (err) => {
        if (err) { callback(err) }

        callback(null, osmTrees)
      }
    )
  }

  assess (callback) {
    if (this.assessment) {
      return callback(null, {
        text: this.assessment,
        trees: this.osmTrees
      })
    }

    this.loadNearbyOSMTrees((err, nearbyTrees) => {
      if (err) { return callback(err) }

      assessTree(this.feature, nearbyTrees, (err, result) => {
        if (err) { return callback(err) }

        this.assessment = result.text
        this.osmTrees = result.trees

        if (this.layer) {
          this.show()
        }

        callback(null, result)
      })
    })
  }
}

Tree.init = (_app, callback) => {
  app = _app
  callback()
}
