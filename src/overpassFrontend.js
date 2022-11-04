import distance from '@turf/distance'
import bboxPolygon from '@turf/bbox-polygon'
import buffer from '@turf/buffer'
import bbox from '@turf/bbox'
import OverpassFrontend from 'overpass-frontend'
import { StatusMessage } from './status'

let app

export const overpassFrontend = {
  init (_app, callback) {
    app = _app
    app.overpassFrontend = new OverpassFrontend(app.config.overpassUrl || 'https://www.overpass-api.de/api/interpreter')
    callback()
    this.loadCache(app.config.bbox, () => {})
  },

  loadCache (boundingbox, callback) {
    let count = 0
    const log = new StatusMessage('initialize OSM cache ... 0 trees found')

    // add a buffer around the bounding box with the size of the searchDistance
    let bounds = bboxPolygon([boundingbox[1], boundingbox[0], boundingbox[3], boundingbox[2]])
    bounds = buffer(bounds, app.config.searchDistance / 1000, { units: 'kilometers' })
    bounds = bbox(bounds)

    // initialize cache
    app.overpassFrontend.BBoxQuery(
      'node[natural=tree]',
      {
        minlat: bounds[1],
        minlon: bounds[0],
        maxlat: bounds[3],
        maxlon: bounds[2]
      },
      {
        properties: OverpassFrontend.GEOM | OverpassFrontend.TAGS,
        priority: -1
      },
      (e, f) => {
        count++
        log.change('initialize OSM cache ... ' + count + ' trees found')
      },
      (err) => {
        if (err) { console.error(err) }
        console.log(count)
        log.change('initialized OSM cache ... ' + count + ' trees found')
        callback(null)
      }
    )
  }
}
