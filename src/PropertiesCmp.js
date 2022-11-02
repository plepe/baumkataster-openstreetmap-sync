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
    },
    compare: (kat, osm) => null
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
      return Math.abs(kat.STAMMUMFANG / 100 - parseFloat(osm.circumference)) < 0.01
    }
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
      let value = this.getValue(properties, field)

      while (td.firstChild) {
        td.removeChild(td.firstChild)
      }

      if (value) {
        td.appendChild(value)
      }
    })
  }

  getValue (properties, field) {
    let value

    if (typeof field === 'string') {
      value = '' + (properties[field] || '')
    } else if (typeof field === 'function') {
      value = field(properties)
    }

    if (typeof value === 'string') {
      value = document.createTextNode(value)
    }

    return value
  }

  compare (kat, osm) {
    fields.forEach((f, i) => {
      const tr = this.table.rows[i + 1]
      let result = null
      if (!('compare' in f) && 'kat' in f && 'osm' in f) {
        result = this.getValue(kat, f.kat).textContent === this.getValue(osm, f.osm).textContent
      } else if (f.compare) {
        result = f.compare(kat, osm)
      }

      tr.classList.remove('correct')
      tr.classList.remove('wrong')
      if (result === true) {
        tr.classList.add('correct')
      } else if (result === false) {
        tr.classList.add('wrong')
      }
    })
  }
}
