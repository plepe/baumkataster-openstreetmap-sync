import fs from 'fs'

const bbox = [ 48.16821, 16.31701, 48.17324, 16.32580 ]

let data = fs.readFileSync('baumkataster.json')
data = JSON.parse(data)

data.features.forEach(function (tree) {
  const coord = tree.geometry.coordinates

  if (coord[0] < bbox[1] || coord[0] > bbox[3] || coord[1] < bbox[0] || coord[1] > bbox[2]) {
    return
  }

  console.log(tree.geometry.coordinates)
})

console.log('fertig')
