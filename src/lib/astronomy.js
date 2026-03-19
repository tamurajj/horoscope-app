import * as Astronomy from 'astronomy-engine'

/**
 * ユリウス世紀（J2000基準）
 */
function julianCenturies(date) {
  const J2000 = new Date('2000-01-01T12:00:00Z')
  return (date - J2000) / (365.25 * 24 * 60 * 60 * 1000 * 100)
}

/**
 * 平均ノード黄経（度）
 * IAU公式: Ω = 125.04452 - 1934.136261×T
 */
function meanNorthNodeLongitude(date) {
  const T = julianCenturies(date)
  return ((125.04452 - 1934.136261 * T) % 360 + 360) % 360
}

/**
 * GeoVectorから黄経（度）を取得
 */
function eclipticLongitude(body, date) {
  const vec = Astronomy.GeoVector(body, date, true)
  const ecl = Astronomy.Ecliptic(vec)
  return ecl.elon
}

/**
 * 惑星位置計算
 * @param {Date} datetime - UTC日時
 * @returns {{ [planet: string]: { longitude: number } }}
 */
export function calcPlanets(datetime) {
  const date = new Date(datetime)

  const moon = Astronomy.EclipticGeoMoon(date)
  const northNode = meanNorthNodeLongitude(date)

  return {
    sun:       { longitude: Astronomy.SunPosition(date).elon },
    moon:      { longitude: moon.lon },
    mercury:   { longitude: eclipticLongitude(Astronomy.Body.Mercury, date) },
    venus:     { longitude: eclipticLongitude(Astronomy.Body.Venus,   date) },
    mars:      { longitude: eclipticLongitude(Astronomy.Body.Mars,    date) },
    jupiter:   { longitude: eclipticLongitude(Astronomy.Body.Jupiter, date) },
    saturn:    { longitude: eclipticLongitude(Astronomy.Body.Saturn,  date) },
    uranus:    { longitude: eclipticLongitude(Astronomy.Body.Uranus,  date) },
    neptune:   { longitude: eclipticLongitude(Astronomy.Body.Neptune, date) },
    pluto:     { longitude: eclipticLongitude(Astronomy.Body.Pluto,   date) },
    northNode: { longitude: northNode },
    southNode: { longitude: (northNode + 180) % 360 },
  }
}