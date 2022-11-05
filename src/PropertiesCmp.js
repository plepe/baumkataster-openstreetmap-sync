export class PropertiesCmp {
  constructor (fields) {
    this.fields = fields
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

    this.fields.forEach(f => {
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

    this.fields.forEach((f, i) => {
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
    this.fields.forEach((f, i) => {
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
