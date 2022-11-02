import assessments from './assessments.json'

let app

export const mapKey = {
  init (_app, callback) {
    app = _app
    show(null)
    callback()
  }
}

function show (data) {
  const mapKey = document.getElementById('map-key')
  mapKey.innerHTML = ''
  for (const text in assessments) {
    const div = document.createElement('div')
    mapKey.appendChild(div)

    const svg = document.createElement('span')
    svg.className = 'icon'
    svg.innerHTML = '<svg width="25" height="25"><circle cx="13" cy="13" r="' + app.config.treeMarker.radius + '" style="stroke-width: ' + app.config.treeMarker.weight + 'px; stroke: ' + assessments[text] + '; fill: none;"></svg>'
    div.appendChild(svg)

    let count = null
    if (data) {
      count = data.features.filter(f => f.properties.assessment === text).length
    }

    const span = document.createElement('span')
    span.className = 'text'
    span.appendChild(document.createTextNode(text + (count === null ? '' : ' (' + count + ')')))
    div.appendChild(span)
  }
}
