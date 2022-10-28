import fs from 'fs'
import fetch from 'node-fetch'

fetch('https://www.overpass-api.de/api/interpreter', {
  method: 'POST',
  body: '[out:json][bbox:48.16821,16.31701,48.17324,16.32580];node[natural=tree];out meta;'
})
  .then(req => req.text())
  .then(data => fs.writeFile('openstreetmap.json', data,
    (err) => {
      if (err) { return console.log(err) }
      console.log('Finished downloading OSM data')
    }
  ))
