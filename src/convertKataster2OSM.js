export function convertKataster2OSM (properties) {
  const tags = {
    denotation: 'urban',
    natural: 'tree'
  }

  tags['tree:ref'] = properties.BAUMNUMMER
  tags.start_date = properties.PFLANZJAHR

  if (properties.GATTUNG_ART === 'Jungbaum wird gepflanzt') {
    tags.species = 'none'
  } else {
    const m = properties.GATTUNG_ART.match(/^([^']+) ('(.*)' )?\((.*)\)$/)
    if (m) {
      tags.taxon = m[1]
      tags.species = m[1]
      tags['species:de'] = m[4]

      if (m[2]) {
        tags.taxon = m[1] + ' ' + m[3]
        tags['taxon:cultivar'] = m[3]
      }
    } else {
      console.error("Can't parse GATTUNG_ART", properties.GATTUNG_ART)
    }
  }

  return tags
}
