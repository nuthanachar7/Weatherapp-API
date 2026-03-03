import { useState, useCallback, useEffect } from 'react'
import { getForecast, autocomplete } from '../api/weatherstack'
import type { Units } from '../api/weatherstack'
import type { DayForecast } from '../types/weather'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import './Page.css'
import './Forecast.css'

export default function Forecast() {
  const [query, setQuery] = useState('')
  const [units, setUnits] = useState<Units>('m')
  const [days, setDays] = useState(7)
  const [data, setData] = useState<Awaited<ReturnType<typeof getForecast>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof autocomplete>>>([])

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setError(null)
    setLoading(true)
    try {
      const res = await getForecast(q, days, units)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Forecast may require a paid plan.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [days, units])

  const handleSelectSuggestion = useCallback((item: { name?: string; lat?: string; lon?: string }) => {
    const str = item.lat != null && item.lon != null ? `${item.lat},${item.lon}` : (item.name || '')
    setQuery(str)
    setSuggestions([])
    handleSearch(str)
  }, [handleSearch])

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

  const forecastDays = data?.forecast ? Object.entries(data.forecast) : []

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Forecast</h2>
        <p className="page-desc">Up to 14-day weather forecast (Professional plan).</p>
      </div>

      <div className="page-toolbar">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
          loading={loading}
        />
        <FilterBar
          unit={units}
          onUnitChange={setUnits}
          extraFilters={
            <div className="filter-group">
              <span className="filter-label">Days</span>
              <select
                className="filter-select"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                aria-label="Forecast days"
              >
                {[1, 3, 5, 7, 10, 14].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          }
        />
      </div>

      {error && (
        <div className="page-error glass" role="alert">{error}</div>
      )}

      {loading && <div className="page-loading">Loading…</div>}

      {!loading && forecastDays.length > 0 && (
        <div className="forecast-grid">
          {forecastDays.map(([date, day]) => {
            const d = day as DayForecast
            return (
              <section key={date} className="glass forecast-card" aria-label={`Forecast for ${date}`}>
                <div className="forecast-date">{date}</div>
                <div className="forecast-temps">
                  <span className="forecast-max">{d.maxtemp}°</span>
                  <span className="forecast-min">{d.mintemp}°</span>
                </div>
                <div className="forecast-astro">
                  <span>Sun {d.astro?.sunrise} – {d.astro?.sunset}</span>
                </div>
                <div className="forecast-extra">
                  UV {d.uv_index} · Sun {d.sunhour}h
                </div>
              </section>
            )
          })}
        </div>
      )}

      {!loading && !data?.forecast && !error && query && (
        <p className="page-muted">Search a location to load forecast. Requires Professional plan for 14-day forecast.</p>
      )}
    </div>
  )
}
