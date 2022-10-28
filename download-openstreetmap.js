import fs from 'fs'
import fetch from 'node-fetch'

const config = JSON.parse(fs.readFileSync('conf.json'))
const bbox = config.bbox.map((c, i) => c + config.bboxBuffer * (i > 1 ? 1 : -1)).join(',')

fetch('https://www.overpass-api.de/api/interpreter', {
  method: 'POST',
  body: '[out:json][bbox:' + bbox + '];node[natural=tree];out meta;'
})
  .then(req => req.text())
  .then(data => fs.writeFile('openstreetmap.json', data,
    (err) => {
      if (err) { return console.log(err) }
      console.log('Finished downloading OSM data')
    }
  ))
