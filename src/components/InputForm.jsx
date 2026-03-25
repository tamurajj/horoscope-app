import { useState } from 'react'
import { searchCity } from '../lib/geocoding'
import { HOUSE_SYSTEMS } from '../constants/astro'

export default function InputForm({ onSubmit }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [city, setCity] = useState('')
  const [houseSystem, setHouseSystem] = useState('equal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // 修正 #6: 入力値のtrim + バリデーション
    const trimmedCity = city.trim()
    if (!date || !time || !trimmedCity) {
      setError('すべての項目を入力してください')
      return
    }

    setLoading(true)
    try {
      const { lat, lng, timezone, displayName } = await searchCity(trimmedCity)

      // 修正 #1: UTC変換ロジックを修正
      // localStr はブラウザのTZに依存せず「壁時計の文字列」として扱う
      const localStr = `${date}T${time}:00`

      // new Date(localStr) → ブラウザのローカルTZとして解釈されたDate
      const localDate = new Date(localStr)

      // 同じ壁時計文字列を出生地TZで解釈した場合のUTCミリ秒を取得
      const tzDate = new Date(
        new Date(localStr).toLocaleString('en-US', { timeZone: timezone })
      )

      // 差分 = 出生地TZオフセット（ブラウザTZとの差を含む）
      const offsetMs = localDate - tzDate

      // 補正してUTC基準のDateを生成
      const utcDatetime = new Date(localDate.getTime() + offsetMs)

      onSubmit({ datetime: utcDatetime, lat, lng, houseSystem, displayName })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h1 style={styles.title}>ナタルチャート</h1>

      {/* 修正 #5: htmlFor / id で label と input を紐付け */}
      <div style={styles.field}>
        <label htmlFor="birth-date" style={styles.label}>生年月日</label>
        <input
          id="birth-date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="birth-time" style={styles.label}>出生時刻</label>
        <input
          id="birth-time"
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="birth-city" style={styles.label}>出生地</label>
        <input
          id="birth-city"
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="例：東京、大阪、New York"
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="house-system" style={styles.label}>ハウスシステム</label>
        <select
          id="house-system"
          value={houseSystem}
          onChange={e => setHouseSystem(e.target.value)}
          style={styles.input}
        >
          {Object.entries(HOUSE_SYSTEMS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? '計算中...' : 'チャートを作成'}
      </button>
    </form>
  )
}

const styles = {
  form: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '300',
    letterSpacing: '0.15em',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    color: '#666',
  },
  input: {
    // 修正 #2: iOS自動ズーム防止のため16px固定
    fontSize: '16px',
    fontWeight: '300',
    // 修正 #4: iOSネイティブスタイルを無効化してカスタムスタイルを適用
    WebkitAppearance: 'none',
    appearance: 'none',
    borderRadius: 0,
    border: 'none',
    borderBottom: '1px solid #ccc',
    padding: '0.5rem 0',
    outline: 'none',
    background: 'transparent',
    width: '100%',
  },
  error: {
    fontSize: '0.8rem',
    color: '#c00',
  },
  button: {
    marginTop: '0.5rem',
    // 修正 #3: タップ領域をApple HIG推奨の44px以上に
    minHeight: '44px',
    padding: '0.75rem',
    background: '#111',
    color: '#fff',
    border: 'none',
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
  },
}
