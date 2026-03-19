const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const TIMEZONE_URL  = 'https://timeapi.io/api/timezone/coordinate'

/**
 * 都市名 → 緯度経度・タイムゾーン
 * @param {string} cityName
 * @returns {Promise<{ lat: number, lng: number, timezone: string, displayName: string }>}
 */
export async function searchCity(cityName) {
  if (!cityName || cityName.trim().length === 0) {
    throw new Error('都市名を入力してください')
  }

  const params = new URLSearchParams({
    q: cityName.trim(),
    format: 'json',
    limit: '1',
  })

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'Accept-Language': 'ja,en',
      'User-Agent': 'horoscope-app/1.0',
    },
  })

  if (!res.ok) {
    throw new Error(`ジオコーディングに失敗しました (${res.status})`)
  }

  const data = await res.json()

  if (!data || data.length === 0) {
    throw new Error(`「${cityName}」が見つかりませんでした`)
  }

  const { lat, lon, display_name } = data[0]
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lon)

  const tzRes = await fetch(`${TIMEZONE_URL}?latitude=${latNum}&longitude=${lngNum}`)
  if (!tzRes.ok) {
    throw new Error('タイムゾーンの取得に失敗しました')
  }
  const tzData = await tzRes.json()
  const timezone = tzData.timeZone
  if (!timezone) {
    throw new Error('タイムゾーンの取得に失敗しました')
  }

  return { lat: latNum, lng: lngNum, timezone, displayName: display_name }
}