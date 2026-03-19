import { ASPECTS, PLANETS } from '../constants/astro'

/**
 * 2天体間の角度差（0〜180°）
 */
function angleDiff(a, b) {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

/**
 * アスペクト計算
 * @param {{ [planet: string]: { longitude: number } }} planets
 * @returns {Array<{ planet1: string, planet2: string, type: string, orb: number }>}
 */
export function calcAspects(planets) {
  const results = []

  for (let i = 0; i < PLANETS.length; i++) {
    for (let j = i + 1; j < PLANETS.length; j++) {
      const p1 = PLANETS[i]
      const p2 = PLANETS[j]

      if (!planets[p1] || !planets[p2]) continue

      const diff = angleDiff(planets[p1].longitude, planets[p2].longitude)

      for (const [type, { angle, orb }] of Object.entries(ASPECTS)) {
        const actualOrb = Math.abs(diff - angle)
        if (actualOrb <= orb) {
          results.push({ planet1: p1, planet2: p2, type, orb: actualOrb })
          break
        }
      }
    }
  }

  return results
}