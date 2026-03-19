import { useState } from 'react'
import InputForm from './components/InputForm'
import Chart from './components/Chart'
import { calcPlanets } from './lib/astronomy'
import { calcHouses } from './lib/houses'
import { calcAspects } from './lib/aspects'

export default function App() {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit({ datetime, lat, lng, houseSystem, displayName }) {
    setLoading(true)
    setError('')
    try {
      const planets = calcPlanets(datetime)
      const houses  = calcHouses(datetime, lat, lng, houseSystem)
      const aspects = calcAspects(planets)
      setChartData({ planets, houses, aspects, displayName, datetime })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <InputForm onSubmit={handleSubmit} />

      {loading && <p style={styles.message}>計算中...</p>}
      {error   && <p style={styles.error}>{error}</p>}

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
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: '300',
    color: '#111',
    background: '#fafafa',
    paddingBottom: '4rem',
  },
  message: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#888',
    letterSpacing: '0.08em',
  },
  error: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#c00',
  },
  chartWrapper: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  meta: {
    fontSize: '0.75rem',
    color: '#999',
    textAlign: 'center',
    marginBottom: '1rem',
    letterSpacing: '0.05em',
  },
}