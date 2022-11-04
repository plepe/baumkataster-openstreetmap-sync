import fs from 'fs'
import fetch from 'node-fetch'
import async from 'async'

const config = JSON.parse(fs.readFileSync('conf.json'))

const gridSize = config.gridSize || [ 0.01, 0.01 ]
const path = 'data/baumkataster-tiles'
const tiles = {}

async.parallel([
  done => fs.mkdir(path, { recursive: true }, done),
  done => {
    fetch('https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BAUMKATOGD&srsName=EPSG:4326&outputFormat=json')
      .then(req => req.json())
      .then(data => {
        data.features.forEach(feature => {
          const tile = feature.geometry.coordinates.map((c, i) => parseInt(c / gridSize[i]))
          const tileId = tile.join(',')
          if (!(tileId in tiles)) {
            tiles[tileId] = []
          }
          tiles[tileId].push(feature)
        })

        async.eachOf(tiles, (tile, tileId, done) => {
          console.log('  writing', tileId)
          fs.writeFile(
            path + '/' + tileId + '.geojson',
            JSON.stringify({
              type: 'FeatureCollection',
              features: tile
            }),
            done
          )
        })
      })
  }
])
