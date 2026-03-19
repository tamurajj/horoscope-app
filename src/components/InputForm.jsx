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

    if (!date || !time || !city) {
      setError('すべての項目を入力してください')
      return
    }

    setLoading(true)
    try {
      const { lat, lng, timezone, displayName } = await searchCity(city)

      // ローカル日時 → UTC変換
      const localStr = `${date}T${time}:00`
      const datetime = new Date(
        new Date(localStr).toLocaleString('en-US', { timeZone: timezone })
      )
      const utcDatetime = new Date(
        new Date(localStr) - (new Date(new Date(localStr).toLocaleString('en-US', { timeZone: timezone })) - new Date(localStr))
      )

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

      <div style={styles.field}>
        <label style={styles.label}>生年月日</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>出生時刻</label>
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>出生地</label>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="例：東京、大阪、New York"
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>ハウスシステム</label>
        <select
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
    border: 'none',
    borderBottom: '1px solid #ccc',
    padding: '0.5rem 0',
    fontSize: '1rem',
    fontWeight: '300',
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
    padding: '0.75rem',
    background: '#111',
    color: '#fff',
    border: 'none',
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
  },
}