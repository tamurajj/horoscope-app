import { useState, useMemo } from 'react'
import { SIGNS, PLANETS, PLANET_LABELS } from '../constants/astro'
import { SYMBOLS } from './symbols'

const CX = 200
const CY = 200
const R_OUTER     = 180
const R_SIGN      = 152
const R_INNER     = 120
const R_PLANET    = 136
const R_HOUSE_NUM = 100

const MIN_DIST = 24  // 20pxアイコン + 余白

function toRad(deg) { return (deg * Math.PI) / 180 }

function lonToXY(lon, r, rotation = 0) {
  const angle = toRad(-(lon - 180) + rotation)
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  }
}

const ASPECT_COLORS = {
  conjunction: '#bbb',
  opposition:  '#bbb',
  trine:       '#ccc',
  square:      '#d5d5d5',
  sextile:     '#ddd',
}

function lonToSignLabel(lon) {
  const signIndex = Math.floor(lon / 30)
  const raw = lon % 30
  const degree = Math.floor(raw)
  const minute = Math.floor((raw - degree) * 60)
  const signs = ['牡羊座','牡牛座','双子座','蟹座','獅子座','乙女座','天秤座','蠍座','射手座','山羊座','水瓶座','魚座']
  return `${signs[signIndex]} ${degree}°${String(minute).padStart(2, '0')}'`
}

function computeDisplayLons(planets) {
  const entries = PLANETS
    .filter(p => planets[p])
    .map(p => ({ planet: p, lon: planets[p].longitude }))
    .sort((a, b) => a.lon - b.lon)

  if (entries.length === 0) return {}

  const minSepDeg = (MIN_DIST / R_PLANET) * (180 / Math.PI)
  const n = entries.length
  const lons = entries.map(e => e.lon)

  for (let iter = 0; iter < 200; iter++) {
    let moved = false
    for (let i = 0; i < n - 1; i++) {
      const diff = lons[i + 1] - lons[i]
      if (diff < minSepDeg) {
        const mid = (lons[i] + lons[i + 1]) / 2
        lons[i]     = mid - minSepDeg / 2
        lons[i + 1] = mid + minSepDeg / 2
        moved = true
      }
    }
    const wrapDiff = (lons[0] + 360) - lons[n - 1]
    if (wrapDiff < minSepDeg) {
      const push = (minSepDeg - wrapDiff) / 2
      lons[n - 1] -= push
      lons[0]     += push
      moved = true
    }
    if (!moved) break
  }

  const result = {}
  entries.forEach((e, i) => {
    result[e.planet] = ((lons[i] % 360) + 360) % 360
  })
  return result
}

export default function Chart({ planets, houses, aspects }) {
  const { cusps, asc } = houses
  const [activeTooltip, setActiveTooltip] = useState(null)

  const xy = (lon, r) => lonToXY(lon, r, asc)
  const displayLons = useMemo(() => computeDisplayLons(planets), [planets])

  const handlePlanetClick = (planet) => {
    setActiveTooltip(prev => prev === planet ? null : planet)
  }

  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '480px', display: 'block', margin: '0 auto' }}
    >
      {/* 背景 */}
      <rect width="400" height="400" fill="#ffffff"/>

      {/* リング */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#999" strokeWidth="0.75"/>
      <circle cx={CX} cy={CY} r={R_SIGN}  fill="none" stroke="#999" strokeWidth="0.75"/>
      <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#bbb" strokeWidth="0.5"/>

      {/* 12サイン区切り線・ラベル */}
      {SIGNS.map((sign, i) => {
        const lon = i * 30
        const p1 = xy(lon, R_SIGN)
        const p2 = xy(lon, R_OUTER)
        const mid = xy(lon + 15, (R_SIGN + R_OUTER) / 2)
        return (
          <g key={sign}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#ccc" strokeWidth="0.5"/>
            <text
              x={mid.x} y={mid.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="12" fill="#999" fontWeight="300"
            >
              {sign.slice(0, 2)}
            </text>
          </g>
        )
      })}

      {/* ハウスカスプ線 */}
      {cusps.map((lon, i) => {
        const p1 = xy(lon, 0)
        const p2 = xy(lon, R_SIGN)
        const isAngle = i === 0 || i === 3 || i === 6 || i === 9
        return (
          <line
            key={i}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isAngle ? '#555' : '#ddd'}
            strokeWidth={isAngle ? '1' : '0.5'}
          />
        )
      })}

      {/* ハウス番号 */}
      {cusps.map((lon, i) => {
        const next = cusps[(i + 1) % 12]
        const mid = next >= lon
          ? (lon + next) / 2
          : ((lon + next + 360) / 2) % 360
        const { x, y } = xy(mid, R_HOUSE_NUM)
        return (
          <text
            key={i}
            x={x} y={y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="12" fill="#bbb" fontWeight="300"
          >
            {i + 1}
          </text>
        )
      })}

      {/* アスペクト線 */}
      {aspects.map(({ planet1, planet2, type }, i) => {
        const lon1 = displayLons[planet1] ?? planets[planet1]?.longitude
        const lon2 = displayLons[planet2] ?? planets[planet2]?.longitude
        if (lon1 == null || lon2 == null) return null
        const p1 = xy(lon1, R_PLANET)
        const p2 = xy(lon2, R_PLANET)
        return (
          <line
            key={i}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={ASPECT_COLORS[type]}
            strokeWidth="0.5"
          />
        )
      })}

      {/* 天体シンボル */}
      {PLANETS.map(planet => {
        if (!planets[planet]) return null
        const dispLon = displayLons[planet] ?? planets[planet].longitude
        const { x, y } = xy(dispLon, R_PLANET)
        const isActive = activeTooltip === planet
        return (
          <g
            key={planet}
            transform={`translate(${x - 10}, ${y - 10})`}
            onClick={() => handlePlanetClick(planet)}
            style={{ cursor: 'pointer' }}
          >
            {/* タップ領域 36×36 */}
            <rect x="-8" y="-8" width="36" height="36" fill="transparent"/>
            <svg
              width="20" height="20"
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: SYMBOLS[planet] }}
              style={{ color: isActive ? '#888' : '#222', overflow: 'visible' }}
            />
          </g>
        )
      })}

      {/* ツールチップ */}
      {activeTooltip && planets[activeTooltip] && (() => {
        const actualLon = planets[activeTooltip].longitude
        const dispLon = displayLons[activeTooltip] ?? actualLon
        const { x, y } = xy(dispLon, R_PLANET)

        // ハウス判定（選択中のハウスシステムの cusps を使用）
        const houseIndex = cusps.reduce((found, cusp, i) => {
          const next = cusps[(i + 1) % 12]
          const inHouse = next > cusp
            ? actualLon >= cusp && actualLon < next
            : actualLon >= cusp || actualLon < next  // 360°をまたぐケース
          return inHouse ? i : found
        }, 0)
        const houseLabel = `${houseIndex + 1} ハウス`

        const TW = 90, TH = 56, PAD = 8
        const tx = Math.min(Math.max(x - TW / 2, 4), 400 - TW - 4)
        const ty = y < CY ? y + 14 : y - TH - 14
        return (
          <g>
            <rect
              x={tx} y={ty} width={TW} height={TH}
              rx="3" ry="3"
              fill="#fff" stroke="#ddd" strokeWidth="0.5"
            />
            <text x={tx + PAD} y={ty + 16} fontSize="12" fill="#333" fontWeight="300">
              {PLANET_LABELS[activeTooltip]}
            </text>
            <text x={tx + PAD} y={ty + 32} fontSize="12" fill="#333" fontWeight="300">
              {lonToSignLabel(actualLon)}
            </text>
            <text x={tx + PAD} y={ty + 48} fontSize="12" fill="#333" fontWeight="300">
              {houseLabel}
            </text>
          </g>
        )
      })()}
    </svg>
  )
}
