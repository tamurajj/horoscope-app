import { SIGNS, PLANETS, PLANET_LABELS } from '../constants/astro'
import { SYMBOLS } from './symbols'

const CX = 200
const CY = 200
const R_OUTER = 180
const R_SIGN   = 155
const R_INNER  = 130
const R_PLANET = 110

function toRad(deg) { return (deg * Math.PI) / 180 }

/**
 * 黄経 → SVG座標（0°=左、反時計回り → 上から時計回りに変換）
 */
function lonToXY(lon, r) {
  const angle = toRad(-(lon - 180))
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  }
}

const ASPECT_COLORS = {
  conjunction: '#111',
  opposition:  '#111',
  trine:       '#555',
  square:      '#888',
  sextile:     '#aaa',
}

export default function Chart({ planets, houses, aspects }) {
  const { cusps, asc } = houses

  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '480px', display: 'block', margin: '0 auto' }}
    >
      {/* 外周リング */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#ccc" strokeWidth="0.5"/>
      <circle cx={CX} cy={CY} r={R_SIGN}  fill="none" stroke="#ccc" strokeWidth="0.5"/>
      <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#ddd" strokeWidth="0.5"/>

      {/* 12サイン区切り線・ラベル */}
      {SIGNS.map((sign, i) => {
        const lon = i * 30
        const p1 = lonToXY(lon, R_SIGN)
        const p2 = lonToXY(lon, R_OUTER)
        const mid = lonToXY(lon + 15, (R_SIGN + R_OUTER) / 2)
        return (
          <g key={sign}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#ccc" strokeWidth="0.5"/>
            <text
              x={mid.x} y={mid.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="#999" fontWeight="300"
            >
              {sign.slice(0, 2)}
            </text>
          </g>
        )
      })}

      {/* ハウスカスプ線 */}
      {cusps.map((lon, i) => {
        const p1 = lonToXY(lon, 0)
        const p2 = lonToXY(lon, R_SIGN)
        const isAngle = i === 0 || i === 3 || i === 6 || i === 9
        return (
          <line
            key={i}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isAngle ? '#333' : '#bbb'}
            strokeWidth={isAngle ? '1' : '0.5'}
          />
        )
      })}

      {/* アスペクト線 */}
      {aspects.map(({ planet1, planet2, type }, i) => {
        const p1 = lonToXY(planets[planet1].longitude, R_INNER - 10)
        const p2 = lonToXY(planets[planet2].longitude, R_INNER - 10)
        return (
          <line
            key={i}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={ASPECT_COLORS[type]}
            strokeWidth="0.5"
            opacity="0.5"
          />
        )
      })}

      {/* 天体シンボル */}
      {PLANETS.map(planet => {
        if (!planets[planet]) return null
        const { x, y } = lonToXY(planets[planet].longitude, R_PLANET)
        return (
          <g key={planet} transform={`translate(${x - 6}, ${y - 6})`}>
            <svg
              width="12" height="12"
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: SYMBOLS[planet] }}
              style={{ color: '#111', overflow: 'visible' }}
            />
          </g>
        )
      })}

      {/* ASCラベル */}
      {(() => {
        const p = lonToXY(asc, R_OUTER + 12)
        return (
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fill="#333" fontWeight="400" letterSpacing="0.05em">
            ASC
          </text>
        )
      })()}
    </svg>
  )
}