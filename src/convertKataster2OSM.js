import { speciesWikidata } from './speciesWikidata.js'

const genusFix = {
  'Eucommina': 'Eucommia',
  'Eleagnus': 'Elaeagnus'
}
// when array, then [ min, recommended, max ]
const heights = {
  0: '',
  1: ['minMax', '3', 0, 5],
  2: ['minMax', '7', 6, 10],
  3: ['minMax', '13', 11, 15],
  4: ['minMax', '18', 16, 20],
  5: ['minMax', '23', 21, 25],
  6: ['minMax', '28', 26, 30],
  7: ['minMax', '33', 31, 35],
  8: ['min', '40', 36]
}
const diameter_crowns = {
  0: '',
  1: ['minMax', '2.5', 0, 3],
  2: ['minMax', '4', 4, 6],
  3: ['minMax', '8', 7, 9],
  4: ['minMax', '11', 10, 12],
  5: ['minMax', '14', 13, 15],
  6: ['minMax', '17', 16, 18],
  7: ['minMax', '20', 19, 21],
  8: ['min', '22', 22]
}
const genus_types = {
  "Abies": "conifer",
  "Acer": "broadleaved",
  "Aesculus": "broadleaved",
  "Ailanthus": "broadleaved",
  "Albizia": "broadleaved",
  "Alnus": "broadleaved",
  "Amelanchier": "broadleaved",
  "Araucaria": "conifer",
  "Baumgruppe": "",
  "Betula": "broadleaved",
  "Broussonetia": "broadleaved",
  "Buxus": "broadleaved",
  "Calocedrus": "conifer",
  "Caragana": "broadleaved",
  "Carpinus": "broadleaved",
  "Castanea": "broadleaved",
  "Catalpa": "broadleaved",
  "Cedrus": "conifer",
  "Celtis": "broadleaved",
  "Cercidiphyllum": "broadleaved",
  "Cercis": "broadleaved",
  "Chamaecyparis": "conifer",
  "Cladrastis": "broadleaved",
  "Cornus": "broadleaved",
  "Corylus": "broadleaved",
  "Cotinus": "broadleaved",
  "Cotoneaster": "broadleaved",
  "Crataegus": "broadleaved",
  "Cryptomeria": "conifer",
  "Cupressocyparis": "conifer",
  "Cupressus": "conifer",
  "Cydonia": "broadleaved",
  "Davidia": "broadleaved",
  "Elaeagnus": "broadleaved",
  "Eucommia": "broadleaved",
  "Exochorda": "broadleaved",
  "Fagus": "broadleaved",
  "Fontanesia": "broadleaved",
  "Frangula": "broadleaved",
  "Fraxinus": "broadleaved",
  "Ginkgo": "broadleaved",
  "Gleditsia": "broadleaved",
  "Gymnocladus": "broadleaved",
  "Hibiscus": "broadleaved",
  "Ilex": "broadleaved",
  "Juglans": "broadleaved",
  "Juniperus": "conifer",
  "Koelreuteria": "broadleaved",
  "Laburnum": "broadleaved",
  "Larix": "broadleaved",
  "Liquidambar": "broadleaved",
  "Liriodendron": "broadleaved",
  "Maclura": "broadleaved",
  "Magnolia": "broadleaved",
  "Malus": "broadleaved",
  "Metasequoia": "conifer",
  "Morus": "broadleaved",
  "Nadelbaum": "conifer",
  "Ostrya": "broadleaved",
  "Parrotia": "broadleaved",
  "Paulownia": "broadleaved",
  "Phellodendron": "broadleaved",
  "Photinia": "broadleaved",
  "Picea": "conifer",
  "Pinus": "conifer",
  "Platanus": "broadleaved",
  "Platycladus": "conifer",
  "Populus": "broadleaved",
  "Prunus": "broadleaved",
  "Pseudotsuga": "conifer",
  "Pterocarya": "broadleaved",
  "Pyrus": "broadleaved",
  "Quercus": "broadleaved",
  "Rhamnus": "broadleaved",
  "Rhus": "broadleaved",
  "Robinia": "broadleaved",
  "Salix": "broadleaved",
  "Sambucus": "broadleaved",
  "Sequoiadendron": "conifer",
  "Sophora": "broadleaved",
  "Sorbus": "broadleaved",
  "Tamarix": "broadleaved",
  "Taxus": "conifer",
  "Tetradium": "broadleaved",
  "Thuja": "conifer",
  "Thujopsis": "conifer",
  "Tilia": "broadleaved",
  "Toona": "broadleaved",
  "Tsuga": "conifer",
  "Ulmus": "broadleaved",
  "Zelkova": "broadleaved"
}
const speciesDeFix = {
  'Sumach, Essigbaum': 'Essigbaum',
  'Kiefer, Föhre': 'Föhre',
  'Schwarzkiefer, Schwarzföhre': 'Schwarzföhre',
  'Blaufichte, Silberfichte': 'Silberfichte'
}

const currentYear = new Date().getFullYear()
function mightBeShrub (tags) {
  const age = tags.start_date ? currentYear - tags.start_date : 100

  if (tags.height && tags.height <=2 && age >= 3) {
    return true
  }

  if (tags.genus === 'Juniperus' && tags.species !== 'Juniperus Virginiana' && tags.height <= 3) {
    return true
  }

  if (tags.genus === 'Sambucus' && tags.height < 4) {
    return true
  }

  return false
}

export function convertKataster2OSM (properties, callback) {
  const tags = {
    denotation: 'urban',
    source: 'OGD Vienna',
    natural: 'tree'
  }

  tags['tree:ref'] = properties.BAUMNUMMER
  tags.start_date = properties.PFLANZJAHR || ''

  tags.genus = ''
  tags['genus:de'] = ''
  tags.taxon = ''
  tags['taxon:cultivar'] = ''
  tags.species = ''
  tags['species:de'] = ''
  tags.circumference = ''

  if (properties.STAMMUMFANG > 0) {
    tags.circumference = (parseFloat(properties.STAMMUMFANG) / 100).toString()
  }
  tags.height = heights[properties.BAUMHOEHE]
  tags.diameter_crown = diameter_crowns[properties.KRONENDURCHMESSER]

  if (properties.GATTUNG_ART === 'Jungbaum wird gepflanzt') {
    tags.species = 'none'
    tags.note = 'Jungbaum wird gepflanzt'
  } else if (properties.GATTUNG_ART === 'unbekannt') {
  } else {
    const m = properties.GATTUNG_ART.match(/^([^ ]+)(?: ([^']+))? ('(.*)' )?\((.*)\)$/)
    if (m) {
      tags.genus = m[1] in genusFix ? genusFix[m[1]] : m[1]
      tags.taxon = tags.genus + (m[2] ? ' ' + m[2] : '')
      tags['taxon:cultivar'] = ''
      tags.species = tags.taxon
      tags['species:de'] = m[5] in speciesDeFix ? speciesDeFix[m[5]] : m[5]
      tags['genus:de'] = m[5]

      if (m[3]) {
        tags.taxon = tags.taxon + ' ' + m[4]
        tags['taxon:cultivar'] = m[4]
      }
    } else {
      console.error("Can't parse GATTUNG_ART", properties.GATTUNG_ART)
    }
  }

  tags.leaf_type = genus_types[tags.genus] || ''

  if (mightBeShrub(tags)) {
    tags.fixme = 'Baum oder Strauch'
  }

  if (tags.species) {
    speciesWikidata(tags.species, (err, id) => {
      if (id) {
        tags['species:wikidata'] = id
      }

      callback(err, tags)
    })
  } else {
    callback(null, tags)
  }
}
