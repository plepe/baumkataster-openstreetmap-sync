import { formatWikidata } from '../src/formatWikidata.js'

export const baumkatasterWien = {
  infoFields: [
    {
      title: 'ID',
      kat: 'BAUM_ID',
      osm: (tags) => {
        const a = document.createElement('a')
        a.target = '_blank'
        a.href = 'https://openstreetmap.org/' + tags['@id']
        a.innerHTML = tags['@id']
        return a
      },
      compare: (kat, osm) => null
    },
    {
      title: 'Distance',
      osm: (tags) => tags['@distance'].toFixed(2) + 'm'
    },
    {
      title: 'District',
      kat: 'BEZIRK'
    },
    {
      title: 'Road / Object',
      kat: 'OBJEKT_STRASSE'
    }
  ],
  propFields: [
    {
      title: 'Number',
      kat: 'BAUMNUMMER',
      osm: 'tree:ref'
    },
    {
      title: 'Species',
      kat: 'GATTUNG_ART',
      osm: (tags) =>
        (tags.species || '') + ('taxon:cultivar' in tags ? " '" + tags['taxon:cultivar'] + "'" : '') +
        ('species:de' in tags ? ' (' + tags['species:de'] + ')' : ''),
      compare: (kat, osm) => {
        if (kat.GATTUNG_ART === 'Jungbaum wird gepflanzt') {
          return osm.species === 'none'
        }

        const osmGATT = (osm.species || '') + ('taxon:cultivar' in osm ? " '" + osm['taxon:cultivar'] + "'" : '') +
        ('species:de' in osm ? ' (' + osm['species:de'] + ')' : '')
        return osmGATT === kat.GATTUNG_ART
      }
    },
    {
      title: 'Year of plantation',
      kat: 'PFLANZJAHR_TXT',
      osm: 'start_date',
      compare: (kat, osm) =>
        (kat.PFLANZJAHR === 0 && !('start_date' in osm)) ||
        (kat.PFLANZJAHR.toString() === osm.start_date)
    },
    {
      title: 'Height',
      kat: 'BAUMHOEHE_TXT',
      osm: 'height',
      compare: (kat, osm) => {
        const m = kat.BAUMHOEHE_TXT.match(/^([0-9]+)-([0-9]+) m$/)
        if (m) {
          return 'height' in osm && parseFloat(osm.height) >= parseFloat(m[1]) && parseFloat(osm.height) <= parseFloat(m[2])
        } else {
          const m1 = kat.BAUMHOEHE_TXT.match(/^> ([0-9]+) m$/)
          if (m1) {
            return 'height' in osm && parseFloat(osm.height) >= parseFloat(m[1])
          }
          return !('height' in osm)
        }
      }
    },
    {
      title: 'Crown diameter',
      kat: 'KRONENDURCHMESSER_TXT',
      osm: 'diameter_crown',
      compare: (kat, osm) => {
        const m = kat.KRONENDURCHMESSER_TXT.match(/^([0-9]+)-([0-9]+) m$/)
        if (m) {
          return 'diameter_crown' in osm && parseFloat(osm.diameter_crown) >= parseFloat(m[1]) && parseFloat(osm.diameter_crown) <= parseFloat(m[2])
        } else {
          const m1 = kat.KRONENDURCHMESSER_TXT.match(/^>([0-9]+) m$/)
          if (m1) {
            return 'diameter_crown' in osm && parseFloat(osm.diameter_crown) >= parseFloat(m[1])
          }
          return !('diameter_crown' in osm)
        }
      }
    },
    {
      title: 'Trunk circumference',
      kat: 'STAMMUMFANG_TXT',
      osm: 'circumference',
      compare: (kat, osm) => {
        return kat.STAMMUMFANG === 0 ? !('circumference' in osm) : Math.abs(kat.STAMMUMFANG / 100 - parseFloat(osm.circumference)) < 0.01
      }
    }
  ],
  osmFields: [
    {
      title: 'Species Wikidata',
      kat: (tags) => formatWikidata(tags, 'species:wikidata'),
      osm: (tags) => formatWikidata(tags, 'species:wikidata')
    },
    {
      title: 'fixme',
      kat: 'fixme',
      osm: 'fixme'
    },
    {
      title: 'denotation',
      kat: 'denotation',
      osm: 'denotation'
    },
    {
      title: 'source',
      kat: 'source',
      osm: 'source'
    }
  ]
}
