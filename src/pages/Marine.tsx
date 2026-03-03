import { useState, useCallback } from 'react'
import { getMarine, getPastMarine } from '../api/weatherstack'
import type { Units } from '../api/weatherstack'
import FilterBar from '../components/FilterBar'
import './Page.css'
import './Marine.css'

export default function Marine() {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [units, setUnits] = useState<Units>('m')
  const [mode, setMode] = useState<'live' | 'past'>('live')
  const [pastStart, setPastStart] = useState('')
  const [pastEnd, setPastEnd] = useState('')
  const [tide, setTide] = useState<'yes' | 'no'>('no')
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return
    if (mode === 'past' && !pastStart) return
    setError(null)
    setLoading(true)
    try {
      if (mode === 'live') {
        const res = await getMarine(latitude, longitude, { tide, units })
        setData(res)
      } else {
        const res = await getPastMarine(
          latitude,
          longitude,
          pastStart,
          pastEnd || undefined,
          { tide, units }
        )
        setData(res)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Marine data may require Standard plan.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [lat, lon, units, mode, pastStart, pastEnd, tide])

  const marineForecast = data?.marine as Record<string, unknown> | undefined
  const marineHistorical = data?.historical as Record<string, unknown> | undefined
  const days = marineForecast
    ? Object.entries(marineForecast)
    : marineHistorical
      ? Object.entries(marineHistorical)
      : []

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Marine Weather</h2>
        <p className="page-desc">
          Live and historical marine weather by latitude and longitude. Standard plan and higher.
        </p>
      </div>

      <div className="marine-filters glass">
        <div className="marine-coords">
          <div className="filter-group">
            <span className="filter-label">Latitude</span>
            <input
              type="text"
              className="filter-input"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="45.00"
            />
          </div>
          <div className="filter-group">
            <span className="filter-label">Longitude</span>
            <input
              type="text"
              className="filter-input"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="-2.00"
            />
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-radio">
            <input
              type="radio"
              name="marine-mode"
              checked={mode === 'live'}
              onChange={() => setMode('live')}
            />
            Live
          </label>
          <label className="filter-radio">
            <input
              type="radio"
              name="marine-mode"
              checked={mode === 'past'}
              onChange={() => setMode('past')}
            />
            Historical
          </label>
        </div>
        {mode === 'past' && (
          <>
            <div className="filter-group">
              <span className="filter-label">Start date</span>
              <input
                type="date"
                className="filter-input"
                value={pastStart}
                onChange={(e) => setPastStart(e.target.value)}
                min="2015-01-01"
              />
            </div>
            <div className="filter-group">
              <span className="filter-label">End date</span>
              <input
                type="date"
                className="filter-input"
                value={pastEnd}
                onChange={(e) => setPastEnd(e.target.value)}
                min={pastStart || '2015-01-01'}
              />
            </div>
          </>
        )}
        <div className="filter-group">
          <label className="filter-radio">
            <input
              type="checkbox"
              checked={tide === 'yes'}
              onChange={(e) => setTide(e.target.checked ? 'yes' : 'no')}
            />
            Include tide
          </label>
        </div>
        <FilterBar unit={units} onUnitChange={setUnits} />
        <button
          type="button"
          className="marine-btn"
          onClick={handleSearch}
          disabled={loading || !lat.trim() || !lon.trim() || (mode === 'past' && !pastStart)}
        >
          {loading ? 'Loading…' : 'Load marine'}
        </button>
      </div>

      {error && (
        <div className="page-error glass" role="alert">{error}</div>
      )}

      {!loading && days.length > 0 && (
        <div className="marine-grid">
          {days.map(([date, day]) => {
            const d = day as Record<string, unknown>
            const hasTemp = d && typeof d === 'object' && 'mintemp' in d && 'maxtemp' in d
            const hasWave = d && typeof d === 'object' && 'significant_height' in d
            return (
              <section key={date} className="glass marine-card">
                <div className="marine-date">{date}</div>
                {hasTemp && (
                  <div className="marine-temps">
                    <span className="forecast-max">{Number(d.maxtemp)}°</span>
                    <span className="forecast-min">{Number(d.mintemp)}°</span>
                  </div>
                )}
                {hasWave && (
                  <div className="marine-detail">
                    Wave height: {String(d.significant_height)} m
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {!loading && !data && !error && (
        <p className="page-muted">
          Enter latitude and longitude, then Load marine. Use Location page to find coordinates.
        </p>
      )}
    </div>
  )
}
