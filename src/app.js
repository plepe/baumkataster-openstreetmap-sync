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
import { baumkataster } from './baumkataster'

const modules = [
  josm,
  map,
  mapKey,
  assessTree,
  overpassFrontend,
  Tree,
  baumkataster
]

let app

class App extends Events {
  constructor () {
    super()
    this.trees = {}
  }

  init () {
    this.load((err) => {
      if (err) { return global.alert(err) }

      async.each(
        modules,
        (module, done) => module.init(this, done),
        (err) => {
          if (err) { return global.alert(err) }
          this.updateMap()
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
    ], (err) => {
      if (err) {
        global.alert(err)
      }

      callback()
    })
  }

  updateMap () {
    let bbox = app.map.getBounds()
    bbox = [bbox.getSouth(), bbox.getWest(), bbox.getNorth(), bbox.getEast()]

    baumkataster.get(bbox, (err, features) => {
      if (err) { return global.alert(err) }

      const list = features.map(feature => {
        const id = feature.id
        if (!(id in this.trees)) {
          this.trees[id] = new Tree(feature)
        }

        return this.trees[id]
      })

      this.show(list)
      this.assessAll(list)
    })
  }

  show (list) {
    document.getElementById('details').innerHTML = ''
    list.forEach(tree => {
      tree.show()
    })
  }

  assessAll (list) {
    const log = new StatusMessage('Assessing trees ... 0%')
    let count = 0
    async.each(list,
      (tree, done) => {
        tree.assess((err) => {
          count++
          log.change('Assessing trees ... ' + (count * 100 / list.length).toFixed(0) + '%')
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
