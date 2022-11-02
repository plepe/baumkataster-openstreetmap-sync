/* global L:false */
import async from 'async'
import Events from 'events'

import josm from './josm'
import { map } from './map'
import { Tree } from './Tree'
import { StatusMessage } from './status'
import assessments from './assessments.json'

const modules = [
  josm,
  map,
  Tree
]

let data
let app

class App extends Events {
  constructor () {
    super()
  }

  init () {
    this.load((err) => {
      if (err) { return global.alert(err) }

      async.each(
        modules,
        (module, done) => module.init(this, done),
        (err) => {
          if (err) { return global.alert(err) }
          this.initMapKey()
          this.map = map.map
          this.show()
        }
      )
    })
  }

  load (callback) {
    async.parallel([
      (done) =>
        fetch('conf.json')
          .then(req => req.json())
          .then(body => {
            this.config = body
            done()
          }),
      (done) => {
        const log = new StatusMessage('Loading baumkataster ...')
        fetch('data/result.geojson')
          .then(req => req.json())
          .then(body => {
            data = body
            log.change('Loading baumkataster ... done')
            done()
          })
      }
    ], (err) => {
      if (err) {
        global.alert(err)
      }

      callback()
    })
  }

  initMapKey () {
    const mapKey = document.getElementById('map-key')
    mapKey.innerHTML = ''
    for (const text in assessments) {
      const div = document.createElement('div')
      mapKey.appendChild(div)

      const svg = document.createElement('span')
      svg.className = 'icon'
      svg.innerHTML = '<svg width="25" height="25"><circle cx="13" cy="13" r="' + this.config.treeMarker.radius + '" style="stroke-width: ' + this.config.treeMarker.weight + 'px; stroke: ' + assessments[text] + '; fill: none;"></svg>'
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

  show () {
    document.getElementById('details').innerHTML = ''
    data.features.forEach(feature => {
      const tree = new Tree(feature)
      tree.show()
    })
  }
}

window.onload = function () {
  app = new App()
  app.init()
}
