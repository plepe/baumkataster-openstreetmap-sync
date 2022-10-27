import fs from 'fs'

const bbox = [ 48.16821, 16.31701, 48.17324, 16.32580 ]

let data = fs.readFileSync('baumkataster.json')
data = JSON.parse(data)

data = data.features.filter(function (tree) {
  const coord = tree.geometry.coordinates
  return (coord[0] >= bbox[1] && coord[0] <= bbox[3] && coord[1] >= bbox[0] && coord[1] <= bbox[2])
})

console.log(data.length)
