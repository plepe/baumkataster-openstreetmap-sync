import { convertKataster2OSM } from './convertKataster2OSM.js'
import { tagCmp } from './tagCmp.js'

let app
const url = 'http://127.0.0.1:8111/'

function exec (param) {
  const _url = url + param

  const xhr = new global.XMLHttpRequest()
  xhr.open('get', _url, true)
  xhr.responseType = 'text'
  xhr.send()
}

function toAddTags (p, current) {
  return Object.keys(p)
    .map(k => {
        let v = p[k]
        if (Array.isArray(v)) {
          if (current && tagCmp(current[k], v)) {
            return
          }
          v = v[1]
        } else {
          if ((current && current[k] === v) || (v === '' && !(k in current))) {
            return
          }
        }

        return encodeURIComponent(k) + '=' + encodeURIComponent(v)
      })
    .filter(v => v)
    .join('%7C')
}

function addActions ({katasterTree, osmTree}) {
  let actions = document.getElementById('actions')
  if (!actions) {
    actions = document.createElement('div')
    actions.id = 'actions'
    actions.innerHTML = '<h4>Actions</h4>'
    document.getElementById('details').appendChild(actions)
  }

  let action
  if (osmTree) {
    action = document.createElement('div')
    action.className = 'josm'
    action.innerHTML = 'Update current tree via JOSM remote control'
    action.onclick = () => {
      const id = osmTree.properties['@id'].substr(0, 1) + osmTree.properties['@id'].split('/')[1]
      convertKataster2OSM(katasterTree.properties,
        (err, tags) => {
          if (err) { return global.alert(err) }

          let p = 'load_object?objects=' + id + '&addtags=' + toAddTags(tags, osmTree.properties)
          exec(p)
        }
      )
    }
    actions.appendChild(action)
  }

  action = document.createElement('div')
  action.className = 'josm'
  action.innerHTML = 'Create new tree via JOSM remote control'
  action.onclick = () => {
    convertKataster2OSM(katasterTree.properties,
      (err, tags) => {
        if (err) { return global.alert(err) }

        let p = 'add_node?lon=' + katasterTree.geometry.coordinates[0] + '&lat=' + katasterTree.geometry.coordinates[1] + '&addtags=' + toAddTags(tags)
        exec(p)
      }
    )
  }
  actions.appendChild(action)
}

function hideActions () {
  const actions = document.getElementById('actions')
  if (!actions) {
    return
  }

  let current = actions.firstChild
  while (current) {
    const next = current.nextSibling
    if (current.className === 'josm') {
      actions.removeChild(current)
    }

    current = next
  }
}

module.exports = {
  init (_app, callback) {
    app = _app
    app.on('tree-show', addActions)
    app.on('tree-hide', hideActions)

    callback()
  }
}
