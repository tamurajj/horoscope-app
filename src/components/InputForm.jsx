import { useState, useRef, useEffect, useCallback } from 'react'
import { searchCity } from '../lib/geocoding'
import { HOUSE_SYSTEMS } from '../constants/astro'

// ── 定数 ────────────────────────────────────────────────
const ITEM_H = 36

const HOUSE_SYSTEM_KEYS = Object.keys(HOUSE_SYSTEMS)

const YEARS   = Array.from({ length: new Date().getFullYear() - 1919 }, (_, i) => 1920 + i)
const MONTHS  = Array.from({ length: 12 }, (_, i) => i + 1)
const HOURS   = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// ── Drum コンポーネント ─────────────────────────────────
function Drum({ items, value, onChange, format, width }) {
  const ref = useRef(null)
  const scrollLock = useRef(false)

  useEffect(() => {
    const idx = items.indexOf(value)
    if (ref.current && idx >= 0) {
      scrollLock.current = true
      ref.current.scrollTop = idx * ITEM_H
      setTimeout(() => { scrollLock.current = false }, 150)
    }
  }, [items, value])

  const handleScroll = useCallback(() => {
    if (scrollLock.current || !ref.current) return
    const idx = Math.round(ref.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(items.length - 1, idx))
    if (items[clamped] !== value) {
      onChange(items[clamped])
    }
  }, [items, value, onChange])

  return (
    <div style={{ ...drumStyles.outer, width }}>
      <div style={drumStyles.fadeTop} />
      <div style={drumStyles.fadeBottom} />
      <div style={drumStyles.highlight} />
      <div
        ref={ref}
        className="drum-scroll"
        onScroll={handleScroll}
        style={drumStyles.scroll}
      >
        <div style={{ height: ITEM_H, flexShrink: 0 }} />
        {items.map(item => (
          <div
            key={item}
            style={{
              ...drumStyles.item,
              color: item === value ? '#111' : '#ccc',
            }}
          >
            {format ? format(item) : item}
          </div>
        ))}
        <div style={{ height: ITEM_H, flexShrink: 0 }} />
      </div>
    </div>
  )
}

const drumStyles = {
  outer: {
    position: 'relative',
    height: ITEM_H * 3,
    overflow: 'hidden',
    background: '#fff',
  },
  scroll: {
    height: '100%',
    overflowY: 'scroll',
    scrollSnapType: 'y mandatory',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
  },
  item: {
    height: ITEM_H,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '300',
    letterSpacing: '0.05em',
    flexShrink: 0,
    scrollSnapAlign: 'center',
    userSelect: 'none',
    transition: 'color 0.1s',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_H,
    height: ITEM_H,
    left: 0,
    right: 0,
    borderTop: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
    pointerEvents: 'none',
    zIndex: 2,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_H,
    background: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))',
    pointerEvents: 'none',
    zIndex: 2,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_H,
    background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))',
    pointerEvents: 'none',
    zIndex: 2,
  },
}

// ── InputForm ────────────────────────────────────────────
export default function InputForm({ onSubmit }) {
  const [year,   setYear]   = useState(1990)
  const [month,  setMonth]  = useState(1)
  const [day,    setDay]    = useState(1)
  const [hour,   setHour]   = useState(12)
  const [minute, setMinute] = useState(0)
  const [city,   setCity]   = useState('')
  const [houseSystem, setHouseSystem] = useState('equal')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const maxDay = daysInMonth(year, month)
  const days   = Array.from({ length: maxDay }, (_, i) => i + 1)
  useEffect(() => {
    if (day > maxDay) setDay(maxDay)
  }, [year, month, maxDay])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedCity = city.trim()
    if (!trimmedCity) {
      setError('出生地を入力してください')
      return
    }

    setLoading(true)
    try {
      const { lat, lng, timezone, displayName } = await searchCity(trimmedCity)

      const localStr   = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`
      const localDate  = new Date(localStr)
      const tzDate     = new Date(
        new Date(localStr).toLocaleString('en-US', { timeZone: timezone })
      )
      const offsetMs    = localDate - tzDate
      const utcDatetime = new Date(localDate.getTime() + offsetMs)

      onSubmit({ datetime: utcDatetime, lat, lng, houseSystem, displayName })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`.drum-scroll::-webkit-scrollbar { display: none; }`}</style>

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* 生年月日 */}
        <div style={styles.field}>
          <label style={styles.label}>生年月日</label>
          <div style={styles.drumRow}>
            <div style={styles.drumCol}>
              <Drum items={YEARS}  value={year}  onChange={setYear}  width={72} />
              <span style={styles.drumUnit}>年</span>
            </div>
            <div style={styles.drumCol}>
              <Drum items={MONTHS} value={month} onChange={setMonth} format={pad} width={48} />
              <span style={styles.drumUnit}>月</span>
            </div>
            <div style={styles.drumCol}>
              <Drum items={days}   value={day}   onChange={setDay}   format={pad} width={48} />
              <span style={styles.drumUnit}>日</span>
            </div>
          </div>
        </div>

        {/* 出生時刻 */}
        <div style={styles.field}>
          <label style={styles.label}>出生時刻</label>
          <div style={styles.drumRow}>
            <div style={styles.drumCol}>
              <Drum items={HOURS}   value={hour}   onChange={setHour}   format={pad} width={48} />
              <span style={styles.drumUnit}>時</span>
            </div>
            <div style={styles.drumCol}>
              <Drum items={MINUTES} value={minute} onChange={setMinute} format={pad} width={48} />
              <span style={styles.drumUnit}>分</span>
            </div>
          </div>
        </div>

        {/* 出生地 */}
        <div style={{ ...styles.field, marginBottom: '0.75rem' }}>
          <label htmlFor="birth-city" style={styles.label}>出生地</label>
          <div style={styles.drumRow}>
            <input
              id="birth-city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="例：東京、大阪、New York"
              style={styles.input}
            />
          </div>
        </div>

        {/* ハウスシステム */}
        <div style={styles.field}>
          <label style={styles.label}>ハウスシステム</label>
          <div style={styles.drumRow}>
            <Drum
              items={HOUSE_SYSTEM_KEYS}
              value={houseSystem}
              onChange={setHouseSystem}
              format={key => HOUSE_SYSTEMS[key]}
              width={200}
            />
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? '計算中...' : 'チャートを作成'}
        </button>
      </form>
    </>
  )
}

const styles = {
  form: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    background: '#fff',
    color: '#111',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.7rem',
    letterSpacing: '0.08em',
    color: '#666',
  },
  drumRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  drumCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  drumUnit: {
    fontSize: '0.7rem',
    color: '#999',
    fontWeight: '300',
    flexShrink: 0,
  },
  input: {
    fontSize: '16px',
    fontWeight: '300',
    WebkitAppearance: 'none',
    appearance: 'none',
    borderRadius: 0,
    border: 'none',
    borderBottom: '1px solid #ccc',
    padding: '0.4rem 0',
    outline: 'none',
    background: '#fff',
    color: '#111',
    width: '214px',
    textAlign: 'center',
  },
  error: {
    fontSize: '0.75rem',
    color: '#c00',
    textAlign: 'center',
    margin: 0,
  },
  button: {
    marginTop: '0.25rem',
    minHeight: '44px',
    padding: '0.6rem',
    background: '#111',
    color: '#fff',
    border: 'none',
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    width: '214px',
    alignSelf: 'center',
  },
}
