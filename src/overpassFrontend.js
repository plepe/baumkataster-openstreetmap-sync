import OverpassFrontend from 'overpass-frontend'
import { StatusMessage } from './status'

let app

export const overpassFrontend = {
  init (_app, callback) {
    app = _app
    app.overpassFrontend = new OverpassFrontend('data/openstreetmap.json')
    callback()

    const log = new StatusMessage('initialize OSM cache ... ')
    // initialize cache
    app.overpassFrontend.BBoxQuery(
      'node[natural=tree]',
      {
        minlat: app.config.bbox[0],
        minlon: app.config.bbox[1],
        maxlat: app.config.bbox[2],
        maxlon: app.config.bbox[3]
      },
      {
        properties: OverpassFrontend.GEOM | OverpassFrontend.TAGS
      },
      () => {},
      (err) => {
        if (err) { console.error(err) }
        log.change('initialize OSM cache ... done')
      }
    )
  }
}
