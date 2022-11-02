import { showTree } from './showTree'
import assessments from './assessments.json'

let app

export class Tree {
  constructor (feature) {
    this.feature = feature
  }

  show () {
    const options = JSON.parse(JSON.stringify(app.config.treeMarker))
    if (this.feature.properties.assessment in assessments) {
      options.color = assessments[this.feature.properties.assessment]
    }

    this.layer = L.circleMarker([this.feature.geometry.coordinates[1], this.feature.geometry.coordinates[0]], options)
    this.layer.addTo(app.map)
    this.layer.on({
      click: (e) => showTree(app, this.feature, this.layer)
    })
  }
}

Tree.init = (_app, callback) => {
  app = _app
  callback()
}
