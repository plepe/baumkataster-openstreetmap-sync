import fs from 'fs'
import fetch from 'node-fetch'

fetch('https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BAUMKATOGD&srsName=EPSG:4326&outputFormat=json')
  .then(req => req.text())
  .then(data => fs.writeFile('baumkataster.json', data,
    (err) => if (err) { console.log(err) }))

fetch('https://www.overpass-api.de/api/interpreter', {
  method: 'POST',
  body: '[out:json][bbox:48.16821,16.31701,48.17324,16.32580];node[natural=tree];out meta;'
})
  .then(req => req.text())
  .then(data => fs.writeFile('openstreetmap.json', data,
    (err) => if (err) { console.log(err) }))
