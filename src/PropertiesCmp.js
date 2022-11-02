const fields = [
  {
    title: 'ID',
    kat: 'BAUM_ID',
    osm: (tags) => {
      const a = document.createElement('a')
      a.target = '_blank'
      a.href = 'https://openstreetmap.org/' + tags['@id']
      a.innerHTML = tags['@id']
      return a
    }
  },
  {
    title: 'Distance',
    osm: (tags) => tags['@distance'].toFixed(2) + 'm'
  },
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
      ('species:de' in tags ? ' (' + tags['species:de'] + ')' : '')
  },
  {
    title: 'Year of plantation',
    kat: 'PFLANZJAHR_TXT',
    osm: 'start_date'
  },
  {
    title: 'Height',
    kat: 'BAUMHOEHE_TXT',
    osm: 'height'
  },
  {
    title: 'Crown diameter',
    kat: 'KRONENDURCHMESSER_TXT',
    osm: 'diameter_crown'
  },
  {
    title: 'Trunk circumference',
    kat: 'STAMMUMFANG_TXT',
    osm: 'circumference'
  },
  {
    title: 'District',
    kat: 'BEZIRK'
  },
  {
    title: 'Road / Object',
    kat: 'OBJEKT_STRASSE'
  },
  {
    title: 'fixme',
    osm: 'fixme'
  }
]

export class PropertiesCmp {
  constructor (app) {
    this.app = app
  }

  init () {
    this.table = document.createElement('table')
    this.table.className = 'properties-cmp'

    const tr = document.createElement('tr')

    const th = document.createElement('th')
    tr.appendChild(th)

    const thKat = document.createElement('th')
    thKat.className = 'kat'
    thKat.innerHTML = 'Baumkataster'
    tr.appendChild(thKat)

    const thOsm = document.createElement('th')
    thOsm.className = 'osm'
    tr.appendChild(thOsm)

    this.table.appendChild(tr)

    fields.forEach(f => {
      const tr = document.createElement('tr')

      const th = document.createElement('th')
      th.innerHTML = f.title
      tr.appendChild(th)

      const tdKat = document.createElement('td')
      tdKat.className = 'kat'
      tr.appendChild(tdKat)

      const tdOsm = document.createElement('td')
      tdOsm.className = 'osm'
      tr.appendChild(tdOsm)

      this.table.appendChild(tr)
    })

    return this.table
  }

  setHeader (title, column) {
    if (typeof title === 'string') {
      title = document.createTextNode(title)
    }

    const index = [ null, 'kat', 'osm' ].indexOf(column)
    const th = this.table.rows[0].cells[index]

    th.appendChild(title)
  }

  show (properties, column) {
    const index = [ null, 'kat', 'osm' ].indexOf(column)

    fields.forEach((f, i) => {
      const td = this.table.rows[i + 1].cells[index]
      if (!(column in f)) {
        return
      }

      const field = f[column]
      let value

      if (typeof field === 'string') {
        value = '' + (properties[field] || '')
      } else if (typeof field === 'function') {
        value = field(properties)
      }

      if (typeof value === 'string') {
        value = document.createTextNode(value)
      }

      while (td.firstChild) {
        td.removeChild(td.firstChild)
      }

      if (value) {
        td.appendChild(value)
      }
    })
  }
}
