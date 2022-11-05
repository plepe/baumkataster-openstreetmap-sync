import async from 'async'

import { StatusMessage } from './status'

let app
let cache = {}
let gridSize

export const baumkataster = {
  get (bbox, callback) {
    const bboxLonLat = [ bbox[1], bbox[0], bbox[3], bbox[2] ]
    const tiles = bboxLonLat.map((v, i) => parseInt(v / gridSize[i % 2]))

    const log = new StatusMessage('Loading baumkataster ...')
    async.map(range(tiles[0], tiles[2] + 1), (x, doneX) =>
      async.map(range(tiles[1], tiles[3] + 1), (y, doneY) => {
        const tileId = x + ',' + y
        if (tileId in cache) {
          return doneY(null, cache[tileId])
        }

        fetch('data/baumkataster-tiles/' + tileId + '.geojson')
          .then(req => {
            if (req.ok) {
              return req.json()
            }

            console.log(req)
            new StatusMessage('Error loading file ' + tileId + '.geojson: ' + req.statusText)
            doneY()
          })
          .then(body => {
            log.change('Loading baumkataster ... done')
            if (body) {
              cache[tileId] = body.features
            }
            doneY(null, cache[tileId])
          })
          .catch(error => {
            console.log(error)
            doneY(error)
          })
      },
      (err, list) => {
        if (err) { return doneX(err) }
        doneX(null, [].concat(...list))
      }),
    (err, list) => {
      if (err) { return callback(err) }
      const allFeatures = [].concat(...list)

      const bboxFeatures = allFeatures.filter(feature => {
        const coord = feature.geometry.coordinates
        return coord[0] >= bbox[1] && coord[0] <= bbox[3] && coord[1] >= bbox[0] && coord[1] <= bbox[2]
      })

      callback(null, bboxFeatures)
    })
  },

  init (_app, callback) {
    app = _app
    gridSize = app.config.gridSize || [ 0.01, 0.01 ]
    callback()
  }
}

// Source: https://stackoverflow.com/a/45355468
function range (start, end) {
  return new Array(end - start).fill().map((d, i) => i + start);
}
