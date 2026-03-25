const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const TIMEZONE_URL  = 'https://timeapi.io/api/timezone/coordinate'

const FETCH_TIMEOUT_MS = 8000

/**
 * タイムアウト付きfetch
 * @param {string} url
 * @param {RequestInit} options
 */
async function fetchWithTimeout(url, options = {}) {
  const { signal: externalSignal, ...rest } = options

  // AbortSignal.any は環境によって未対応のため、自前でタイムアウトを実装
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, { ...rest, signal: controller.signal })
    return res
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('接続がタイムアウトしました。時間をおいて再試行してください')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Nominatimの display_name を短縮する
 * 例: "千葉市, 千葉県, 日本" → "千葉市, 千葉県"（先頭2要素）
 * 例: "New York, New York County, New York, United States" → "New York, New York County"
 * @param {string} displayName
 * @returns {string}
 */
function shortenDisplayName(displayName) {
  if (!displayName) return ''
  const parts = displayName.split(',').map(s => s.trim())
  return parts.slice(0, 2).join(', ')
}

/**
 * 都市名 → 緯度経度・タイムゾーン
 * @param {string} cityName - InputForm側でtrim済みの都市名
 * @returns {Promise<{ lat: number, lng: number, timezone: string, displayName: string }>}
 */
export async function searchCity(cityName) {
  if (!cityName || cityName.length === 0) {
    throw new Error('都市名を入力してください')
  }

  // ── 1. ジオコーディング ──────────────────────────────
  const params = new URLSearchParams({
    q: cityName,
    format: 'json',
    limit: '1',
  })

  let geoRes
  try {
    geoRes = await fetchWithTimeout(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'Accept-Language': 'ja,en',
        'User-Agent': 'horoscope-app/1.0',
      },
    })
  } catch (err) {
    // タイムアウト or ネットワークエラー
    throw new Error(err.message || 'ジオコーディングに失敗しました')
  }

  if (!geoRes.ok) {
    throw new Error(`ジオコーディングに失敗しました (${geoRes.status})`)
  }

  const geoData = await geoRes.json()

  if (!Array.isArray(geoData) || geoData.length === 0) {
    throw new Error(`「${cityName}」が見つかりませんでした`)
  }

  const { lat, lon, display_name } = geoData[0]
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lon)

  if (isNaN(latNum) || isNaN(lngNum)) {
    throw new Error('座標の取得に失敗しました')
  }

  // ── 2. タイムゾーン取得 ──────────────────────────────
  let timezone
  try {
    const tzRes = await fetchWithTimeout(
      `${TIMEZONE_URL}?latitude=${latNum}&longitude=${lngNum}`
    )
    if (!tzRes.ok) {
      throw new Error(`タイムゾーンAPIがエラーを返しました (${tzRes.status})`)
    }
    const tzData = await tzRes.json()
    if (!tzData.timeZone) {
      throw new Error('タイムゾーン情報が取得できませんでした')
    }
    timezone = tzData.timeZone
  } catch (err) {
    // timeapi.io 障害時: ユーザーに再試行を促す
    throw new Error(
      `タイムゾーンの取得に失敗しました。時間をおいて再試行してください。\n（詳細: ${err.message}）`
    )
  }

  return {
    lat: latNum,
    lng: lngNum,
    timezone,
    displayName: shortenDisplayName(display_name),
  }
}