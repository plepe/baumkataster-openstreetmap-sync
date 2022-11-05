export function formatWikidata (tags, key) {
  if (!(key in tags)) {
    return ''
  }

  const a = document.createElement('a')
  a.target = '_blank'
  a.href = 'https://wikidata.org/wiki/' + tags[key]
  a.innerHTML = tags[key]
  return a
}
