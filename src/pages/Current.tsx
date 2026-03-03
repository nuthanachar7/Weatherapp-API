import { useState, useCallback } from 'react'
import { getCurrentWeather } from '../api/weatherstack'
import type { Units } from '../api/weatherstack'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import './Page.css'

export default function Current() {
  const [query, setQuery] = useState('')
  const [units, setUnits] = useState<Units>('m')
  const [data, setData] = useState<Awaited<ReturnType<typeof getCurrentWeather>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setError(null)
    setLoading(true)
    try {
      const res = await getCurrentWeather(q, units)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load current weather')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [units])

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Current Weather</h2>
        <p className="page-desc">Real-time conditions for any location.</p>
      </div>

      <div className="page-toolbar">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          suggestions={[]}
          loading={loading}
        />
        <FilterBar unit={units} onUnitChange={setUnits} />
      </div>

      {error && (
        <div className="page-error glass" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="page-loading">Loading…</div>
      )}

      {!loading && data?.location && data?.current && (
        <div className="current-cards">
          <section className="glass current-hero" aria-label="Current conditions">
            <div className="current-loc">
              <span className="current-name">{data.location.name}</span>
              {(data.location.region || data.location.country) && (
                <span className="current-meta">
                  {[data.location.region, data.location.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
            <div className="current-main">
              {data.current.weather_icons?.[0] && (
                <img
                  src={data.current.weather_icons[0]}
                  alt=""
                  className="current-icon"
                />
              )}
              <div>
                <span className="current-temp">{data.current.temperature}°</span>
                <span className="current-desc">
                  {data.current.weather_descriptions?.[0] || '—'}
                </span>
              </div>
            </div>
            <div className="current-details">
              <div className="detail"><span className="detail-label">Feels like</span> {data.current.feelslike}°</div>
              <div className="detail"><span className="detail-label">Humidity</span> {data.current.humidity}%</div>
              <div className="detail"><span className="detail-label">Wind</span> {data.current.wind_speed} km/h {data.current.wind_dir}</div>
              <div className="detail"><span className="detail-label">Pressure</span> {data.current.pressure} mb</div>
              <div className="detail"><span className="detail-label">UV</span> {data.current.uv_index}</div>
              <div className="detail"><span className="detail-label">Visibility</span> {data.current.visibility} km</div>
            </div>
          </section>
        </div>
      )}

      {!loading && !data && !error && query && (
        <p className="page-muted">Enter a location and press Search to see current weather.</p>
      )}
    </div>
  )
}
