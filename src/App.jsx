import { useState, useEffect } from 'react'
import InputForm from './components/InputForm'
import Chart from './components/Chart'
import { calcPlanets } from './lib/astronomy'
import { calcHouses } from './lib/houses'
import { calcAspects } from './lib/aspects'

const FADE_MS = 400

export default function App() {
  const [chartData, setChartData] = useState(null)
  const [error, setError]         = useState('')
  const [phase, setPhase]         = useState('form')  // 'form' | 'chart'
  const [show, setShow]           = useState(false)

  // マウント直後にフォームをフェードイン
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(t)
  }, [])

  async function handleSubmit({ datetime, lat, lng, houseSystem, displayName }) {
    setShow(false)
    setError('')

    await new Promise(r => setTimeout(r, FADE_MS))

    try {
      const planets = calcPlanets(datetime)
      const houses  = calcHouses(datetime, lat, lng, houseSystem)
      const aspects = calcAspects(planets)
      setChartData({ planets, houses, aspects, displayName, datetime })
      setPhase('chart')
    } catch (err) {
      setError(err.message)
    }

    setTimeout(() => setShow(true), 50)
  }

  const fadeStyle = {
    opacity:    show ? 1 : 0,
    transition: `opacity ${FADE_MS}ms ease`,
  }

  return (
    <div style={styles.root}>
      {/* ヘッダー（固定） */}
      <header style={styles.header}>
        <span style={styles.headerTitle}>ホロスコープ無料メーカー</span>
      </header>

      {/* ヘッダー分のオフセット */}
      <div style={styles.body}>

        {/* フォームフェーズ */}
        {phase === 'form' && (
          <div style={fadeStyle}>
            <InputForm onSubmit={handleSubmit} />
            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}

        {/* チャートフェーズ */}
        {phase === 'chart' && (
          <>
            {/* チャートエリア（フェードイン） */}
            <div style={fadeStyle}>
              {chartData && (
                <div style={styles.chartWrapper}>
                  <p style={styles.meta}>
                    {chartData.displayName.split(',')[0]}
                    　{chartData.datetime.toUTCString()}
                  </p>
                  <Chart
                    planets={chartData.planets}
                    houses={chartData.houses}
                    aspects={chartData.aspects}
                  />
                </div>
              )}
            </div>

            {/* フォームセクション（チャート下部・常時表示） */}
            <div style={styles.formSection}>
              <InputForm onSubmit={handleSubmit} />
              {error && <p style={styles.error}>{error}</p>}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

const HEADER_H = 48

const styles = {
  root: {
    minHeight: '100vh',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: '300',
    color: '#111',
    background: '#ffffff',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: `${HEADER_H}px`,
    //paddingTop: 'env(safe-area-inset-top)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',

    zIndex: 100,
  },
  headerTitle: {
    fontSize: '0.8rem',
    letterSpacing: '0.12em',
    color: '#333',
    fontWeight: '300',
  },
  body: {
    paddingTop: `${HEADER_H + 80}px`,  // 80px に増やす
    paddingBottom: '5rem',
  },
  chartWrapper: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '1.5rem 1rem 1rem',  // ← 上の余白を増やす（0 → 1.5rem）
  },
  meta: {
    fontSize: '0.72rem',
    color: '#aaa',
    textAlign: 'center',
    marginBottom: '0.75rem',
    letterSpacing: '0.05em',
  },
  formSection: {
    marginTop: '3rem',
  },
  error: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#c00',
    marginTop: '0.5rem',
  },
}
