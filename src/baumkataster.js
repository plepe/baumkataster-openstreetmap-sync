import { StatusMessage } from './status'

let app
let cache

export const baumkataster = {
  get (bbox, callback) {
    if (cache) {
      return callback(null, cache)
    }

    const log = new StatusMessage('Loading baumkataster ...')
    fetch('data/baum.geojson')
      .then(req => req.json())
      .then(body => {
        log.change('Loading baumkataster ... done')
        if (body) {
          cache = body.features
        }
        callback(null, cache)
      })
  },

  init (_app, callback) {
    app = _app
    callback()
  }
}
