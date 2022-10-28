import fs from 'fs'
import fetch from 'node-fetch'

fetch('https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BAUMKATOGD&srsName=EPSG:4326&outputFormat=json')
  .then(req => req.text())
  .then(data => fs.writeFile('baumkataster.json', data,
    (err) => {
      if (err) { return console.log(err) }
      console.log('Finished downloading baumkataster')
    }
  ))
