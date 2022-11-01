import { convertKataster2OSM } from './convertKataster2OSM.js'

let app
const url = 'http://127.0.0.1:8111/'

function exec (param) {
  const _url = url + param

  const xhr = new global.XMLHttpRequest()
  xhr.open('get', _url, true)
  xhr.responseType = 'text'
  xhr.send()
}

function toAddTags (p) {
  return Object.keys(p)
    .map(k => {
        const v = p[k]
        return encodeURIComponent(k) + '=' + encodeURIComponent(v)
      })
      .join('%7C')
}

function showOsmPopup ({katasterTree, osmTree, popup}) {
  const action = document.createElement('span')
  action.innerHTML = 'JOSM'
  action.onclick = () => {
    const id = osmTree.properties['@id'].substr(0, 1) + osmTree.properties['@id'].split('/')[1]
    const tags = convertKataster2OSM(katasterTree.properties)
    let p = 'load_object?objects=' + id + '&addtags=' + toAddTags(tags)
    exec(p)
  }

  popup.appendChild(action)
}

module.exports = {
  init (_app, callback) {
    app = _app
    app.on('osm-popup', showOsmPopup)

    callback()
  }
}
