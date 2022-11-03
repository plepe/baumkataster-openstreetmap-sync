/* global L:false */
import async from 'async'
import Events from 'events'

import josm from './josm'
import { map } from './map'
import { Tree } from './Tree'
import { mapKey } from './mapKey'
import { assessTree } from './assessTree'
import { StatusMessage } from './status'
import { overpassFrontend } from './overpassFrontend'

const modules = [
  josm,
  map,
  mapKey,
  assessTree,
  overpassFrontend,
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
          this.assessAll()
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
    this.trees = data.features.map(feature => {
      const tree = new Tree(feature)
      tree.show()
      return tree
    })
  }

  assessAll () {
    const log = new StatusMessage('Assessing trees ... 0%')
    let count = 0
    async.each(this.trees,
      (tree, done) => {
        tree.assess((err) => {
          count++
          log.change('Assessing trees ... ' + (count * 100 / data.features.length).toFixed(0) + '%')
          done(err)
        })
      },
      (err) => {
        if (err) { console.error(err) }
        log.change('Assessing trees ... done')
      }
    )
  }
}

window.onload = function () {
  app = new App()
  app.init()
}
