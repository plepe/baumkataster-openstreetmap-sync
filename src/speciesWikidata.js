const cache = {}
const loadCache = {}
let timeout

export function speciesWikidata (species, callback) {
  const m = species.match(/^(.*) x (.*)$/)
  if (m) {
    species = m[1] + ' ×' + m[2]
  }

  if (species in cache) {
    return callback(null, cache[species])
  }

  if (species in loadCache) {
    return loadCache[species].push(callback)
  }

  loadCache[species] = [callback]
  if (!timeout) {
    timeout = global.setTimeout(run, 1)
  }
}

function run () {
  timeout = null
  const species = Object.keys(loadCache)

  const query = 'SELECT ?item ?itemLabel ?scientific WHERE { SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". } ?item wdt:P31 wd:Q16521. ?item wdt:P225 ?scientific. ' + species.map(s => '{ ?item wdt:P225 "' + s + '". }').join(' union ') + ' }'

  fetch('https://query.wikidata.org/sparql?query=' + encodeURIComponent(query),
    {
      headers: {
        Accept: 'application/sparql-results+json'
      }
    }
  )
    .then(req => req.json())
    .then(res => {
      const results = res.results.bindings

      species.forEach(s => cache[s] = null)

      results.forEach(result => {
        const species = result.scientific.value
        cache[species] = result.itemLabel.value
      })

      species.forEach(s => {
        const callbacks = loadCache[s]
        delete loadCache[s]
        callbacks.forEach(cb => cb(null, cache[s]))
      })
    })
}
