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
 * 注: lstNorm < 180 の条件付き補正は不正確なため、常に +180° を適用する
 */
function calcAsc(lst, lat, obl) {
  const lstRad = (lst * Math.PI) / 180
  const latRad = (lat * Math.PI) / 180
  const oblRad = (obl * Math.PI) / 180

  const x = -Math.cos(lstRad)
  const y = Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad)
  const raw = ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360

  // 常に +180°（条件付きにすると RAMC ∈ [180°, 360°) で DSC を返してしまう）
  return (raw + 180) % 360
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
 * コッホハウスカスプ計算
 *
 * 修正内容:
 *   1. kochCusp の象限補正を「常に +180°」に変更
 *      （条件付きにすると RAMC ∈ [180°,360°) で ASC でなく DSC が返る）
 *   2. RAMC オフセットを固定 40° から DSA/NSA（昼夜半弧）ベースに変更
 *   3. 7H = DSC = asc+180°、10H = MC に修正（前回対応済み）
 */
function calcKochCusps(asc, mc, lst, lat, obl) {
  const oblRad = (obl * Math.PI) / 180
  const latRad = (lat * Math.PI) / 180

  // RAMC を受け取り、その時刻の ASC 黄経を返す
  function kochCusp(ramc) {
    const lstRad = (((ramc % 360) + 360) % 360) * Math.PI / 180
    const x = -Math.cos(lstRad)
    const y = Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad)
    const raw = ((Math.atan2(x, y) * 180 / Math.PI) + 360) % 360
    return (raw + 180) % 360  // 常に +180°（条件なし）
  }

  // ASC 度数の赤緯 → 昼半弧 DSA・夜半弧 NSA を計算
  const ascRad = (asc * Math.PI) / 180
  const decAsc = Math.asin(Math.sin(ascRad) * Math.sin(oblRad))
  const sinAD  = Math.tan(latRad) * Math.tan(decAsc)
  // 高緯度での値域外を guard
  const dsa = Math.abs(sinAD) <= 1
    ? 90 + (Math.asin(sinAD) * 180 / Math.PI)
    : sinAD > 0 ? 180 : 0
  const nsa = 180 - dsa

  // 11H/12H: MC → ASC の昼半弧を 3 等分（過去方向 = RAMC を引く）
  const c11 = kochCusp(lst - (2 / 3) * dsa) // MC 直後（1/3 から MC 側）
  const c12 = kochCusp(lst - (1 / 3) * dsa) // ASC 直前（2/3 から MC 側）

  // 2H/3H: ASC → IC の夜半弧を 3 等分（未来方向 = RAMC を足す）
  const c2  = kochCusp(lst + (1 / 3) * nsa) // ASC 直後
  const c3  = kochCusp(lst + (2 / 3) * nsa) // IC 直前

  return [
    asc,                      // 1H  = ASC
    c2,                       // 2H
    c3,                       // 3H
    (mc + 180) % 360,         // 4H  = IC
    (c11 + 180) % 360,        // 5H  = 11H の対角
    (c12 + 180) % 360,        // 6H  = 12H の対角
    (asc + 180) % 360,        // 7H  = DSC
    (c2  + 180) % 360,        // 8H  = 2H の対角
    (c3  + 180) % 360,        // 9H  = 3H の対角
    mc,                       // 10H = MC
    c11,                      // 11H
    c12,                      // 12H
  ].map(v => ((v % 360) + 360) % 360)
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
    const startSign = Math.floor(asc / 30) * 30
    cusps = Array.from({ length: 12 }, (_, i) => (startSign + i * 30) % 360)

  } else if (system === 'equal') {
    cusps = Array.from({ length: 12 }, (_, i) => (asc + i * 30) % 360)

  } else {
    // コッホハウス
    cusps = calcKochCusps(asc, mc, lst, lat, obl)
  }
  return { cusps, asc, mc }
}