import * as Astronomy from 'astronomy-engine'

/**
 * ユリウス世紀（J2000基準）
 */
function julianCenturies(date) {
  const J2000 = new Date('2000-01-01T12:00:00Z')
  return (date - J2000) / (365.25 * 24 * 60 * 60 * 1000 * 100)
}

/**
 * 黄道傾斜角（度）IAU公式
 */
function obliquity(date) {
  const T = julianCenturies(date)
  return 23.439291111 - 0.013004167 * T - 1.6389e-7 * T * T + 5.0361e-7 * T * T * T
}

/**
 * 地方恒星時（度）
 */
function localSiderealTimeDeg(date, lng) {
  const gast = Astronomy.SiderealTime(date) // 時間単位
  return ((gast * 15 + lng) % 360 + 360) % 360
}

/**
 * ASC（上昇点）黄経を計算
 */
function calcAsc(lst, lat, obl) {
  const lstRad = (lst * Math.PI) / 180
  const latRad = (lat * Math.PI) / 180
  const oblRad = (obl * Math.PI) / 180

  const x = -Math.cos(lstRad)
  const y = Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad)
  const asc = (Math.atan2(x, y) * 180) / Math.PI

  // 象限補正
  const lstNorm = ((lst % 360) + 360) % 360
  let result = ((asc % 360) + 360) % 360
  if (lstNorm >= 0 && lstNorm < 180) result = (result + 180) % 360
  return result
}

/**
 * MC（南中点）黄経を計算
 */
function calcMc(lst, obl) {
  const lstRad = (lst * Math.PI) / 180
  const oblRad = (obl * Math.PI) / 180
  const mc = (Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad)) * 180) / Math.PI
  return ((mc % 360) + 360) % 360
}

/**
 * ハウスカスプ計算
 * @param {Date} datetime - UTC日時
 * @param {number} lat - 緯度
 * @param {number} lng - 経度
 * @param {'equal'|'wholesign'|'koch'} system
 * @returns {{ cusps: number[], asc: number, mc: number }}
 */
export function calcHouses(datetime, lat, lng, system) {
  const date = new Date(datetime)
  const obl = obliquity(date)
  const lst = localSiderealTimeDeg(date, lng)
  const asc = calcAsc(lst, lat, obl)
  const mc  = calcMc(lst, obl)

  let cusps

  if (system === 'wholesign') {
    // ASCが属するサインの0°が第1ハウス
    const startSign = Math.floor(asc / 30) * 30
    cusps = Array.from({ length: 12 }, (_, i) => (startSign + i * 30) % 360)

  } else if (system === 'equal') {
    // ASCから30°ずつ
    cusps = Array.from({ length: 12 }, (_, i) => (asc + i * 30) % 360)

  } else {
    // コッホハウス
    cusps = calcKochCusps(asc, mc, lst, lat, obl)
  }

  return { cusps, asc, mc }
}

/**
 * コッホハウスカスプ計算
 */
function calcKochCusps(asc, mc, lst, lat, obl) {
  const latRad = (lat * Math.PI) / 180
  const oblRad = (obl * Math.PI) / 180

  // 各ハウスのカスプを反復法で求める
  function kochCusp(fraction) {
    const adjustedLst = (lst - fraction * 120 + 360) % 360
    const lstRad = (adjustedLst * Math.PI) / 180
    const x = -Math.cos(lstRad)
    const y = Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad)
    let cusp = ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360
    const adjustedNorm = ((adjustedLst % 360) + 360) % 360
    if (adjustedNorm >= 0 && adjustedNorm < 180) cusp = (cusp + 180) % 360
    return cusp
  }

  const c2 = kochCusp(1 / 3)
  const c3 = kochCusp(2 / 3)

  return [
    asc,
    c2,
    c3,
    (mc + 180) % 360, // 4H = IC
    (c3 + 180) % 360,
    (c2 + 180) % 360,
    mc,               // 7H = DSC
    (c2 + 180) % 360,
    (c3 + 180) % 360,
    (mc + 180) % 360,
    (c3 + 180) % 360,
    (c2 + 180) % 360,
  ].map(v => ((v % 360) + 360) % 360)
}