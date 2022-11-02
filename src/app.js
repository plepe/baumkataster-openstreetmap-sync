/* global L:false */
import async from 'async'
import Events from 'events'

import josm from './josm'
import { map } from './map'
import { Tree } from './Tree'
import { mapKey } from './mapKey'
import { StatusMessage } from './status'

const modules = [
  josm,
  map,
  mapKey,
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
