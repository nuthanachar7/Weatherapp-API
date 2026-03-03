import { useState, useCallback, useEffect } from 'react'
import { getHistorical, autocomplete } from '../api/weatherstack'
import type { DayForecast } from '../types/weather'
import type { Units } from '../api/weatherstack'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import './Page.css'
import './Historical.css'

export default function Historical() {
  const [query, setQuery] = useState('')
  const [units, setUnits] = useState<Units>('m')
  const [mode, setMode] = useState<'single' | 'range'>('single')
  const [date, setDate] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [data, setData] = useState<Awaited<ReturnType<typeof getHistorical>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof autocomplete>>>([])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    if (mode === 'single' && !date) return
    if (mode === 'range' && (!dateStart || !dateEnd)) return
    setError(null)
    setLoading(true)
    try {
      const options: Parameters<typeof getHistorical>[1] = { units }
      if (mode === 'single') options.historical_date = date
      else {
        options.historical_date_start = dateStart
        options.historical_date_end = dateEnd
      }
      const res = await getHistorical(query, options)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Historical data may require Standard plan.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [query, units, mode, date, dateStart, dateEnd])

  const handleSelectSuggestion = useCallback((item: { name?: string; lat?: string; lon?: string }) => {
    const str = item.lat != null && item.lon != null ? `${item.lat},${item.lon}` : (item.name || '')
    setQuery(str)
    setSuggestions([])
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await autocomplete(query.trim())
        setSuggestions(Array.isArray(res) ? res : [])
      } catch {
        setSuggestions([])
      }
    }, 320)
    return () => clearTimeout(t)
  }, [query])

  const historicalDays = data?.historical ? Object.entries(data.historical) : []

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Historical Weather</h2>
        <p className="page-desc">Past weather by date or range (max 60 days). Standard plan+.</p>
      </div>

      <div className="page-toolbar">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={() => handleSearch()}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
          loading={loading}
        />
        <FilterBar unit={units} onUnitChange={setUnits} />
      </div>

      <div className="historical-filters glass">
        <div className="filter-group">
          <label className="filter-radio">
            <input
              type="radio"
              name="hist-mode"
              checked={mode === 'single'}
              onChange={() => setMode('single')}
            />
            Single date
          </label>
          <label className="filter-radio">
            <input
              type="radio"
              name="hist-mode"
              checked={mode === 'range'}
              onChange={() => setMode('range')}
            />
            Date range
          </label>
        </div>
        {mode === 'single' && (
          <div className="filter-group">
            <span className="filter-label">Date</span>
            <input
              type="date"
              className="filter-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min="2008-07-01"
            />
          </div>
        )}
        {mode === 'range' && (
          <>
            <div className="filter-group">
              <span className="filter-label">Start</span>
              <input
                type="date"
                className="filter-input"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                min="2008-07-01"
              />
            </div>
            <div className="filter-group">
              <span className="filter-label">End</span>
              <input
                type="date"
                className="filter-input"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                min={dateStart || '2008-07-01'}
              />
            </div>
          </>
        )}
        <button
          type="button"
          className="historical-btn"
          onClick={() => handleSearch()}
          disabled={loading || !query.trim() || (mode === 'single' ? !date : !dateStart || !dateEnd)}
        >
          {loading ? 'Loading…' : 'Load historical'}
        </button>
      </div>

      {error && (
        <div className="page-error glass" role="alert">{error}</div>
      )}

      {!loading && historicalDays.length > 0 && (
        <div className="historical-grid">
          {historicalDays.map(([d, day]) => {
            const dy = day as DayForecast
            return (
              <section key={d} className="glass historical-card">
                <div className="historical-date">{d}</div>
                <div className="historical-temps">
                  <span className="forecast-max">{dy.avgtemp}°</span> avg
                </div>
                <div className="historical-detail">
                  Min {dy.mintemp}° · Max {dy.maxtemp}°
                </div>
                {dy.sunhour != null && (
                  <div className="historical-detail">Sun {dy.sunhour}h</div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {!loading && !data?.historical && !error && (
        <p className="page-muted">Choose location, date(s), and click Load historical.</p>
      )}
    </div>
  )
}
