const cache = {}
const loadCache = {}

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

  const query = 'SELECT ?item ?itemLabel WHERE { SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". } ?item wdt:P31 wd:Q16521. ?item wdt:P225 "' + species + '". }'

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
      const value = results.length ? results[0].itemLabel.value : null
      cache[species] = value

      const callbacks = loadCache[species]
      delete loadCache[species]
      callbacks.forEach(cb => cb(null, value))
    })
}
