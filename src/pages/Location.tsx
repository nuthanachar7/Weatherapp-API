import { useState, useCallback, useEffect } from 'react'
import { autocomplete } from '../api/weatherstack'
import type { LocationResult } from '../types/weather'
import './Page.css'
import './Location.css'

export default function Location() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await autocomplete(q.trim())
      setResults(Array.isArray(res) ? (res as LocationResult[]) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Autocomplete failed.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 2) search(query)
      else setResults([])
    }, 350)
    return () => clearTimeout(t)
  }, [query, search])

  const filtered = filter.trim()
    ? results.filter(
        (r: LocationResult) =>
          (r.name?.toLowerCase().includes(filter.toLowerCase()) ||
           r.country?.toLowerCase().includes(filter.toLowerCase()) ||
           r.region?.toLowerCase().includes(filter.toLowerCase()))
      )
    : results

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Location Lookup</h2>
        <p className="page-desc">Search and filter locations for use in Current, Forecast, and Historical.</p>
      </div>

      <div className="location-toolbar glass">
        <div className="location-search-wrap">
          <label className="search-bar-label" htmlFor="location-query">Search</label>
          <input
            id="location-query"
            type="text"
            className="filter-input location-input glass"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type city or place name…"
            autoComplete="off"
          />
        </div>
        <div className="location-filter-wrap">
          <label className="search-bar-label" htmlFor="location-filter">Filter results</label>
          <input
            id="location-filter"
            type="text"
            className="filter-input location-input glass"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name, region, country…"
          />
        </div>
      </div>

      {error && (
        <div className="page-error glass" role="alert">{error}</div>
      )}

      {loading && <div className="page-loading">Searching…</div>}

      {!loading && filtered.length > 0 && (
        <div className="location-list glass">
          <table className="location-table" role="grid">
            <thead>
              <tr>
                <th>Name</th>
                <th>Region</th>
                <th>Country</th>
                <th>Lat / Lon</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: LocationResult, i: number) => (
                <tr key={`${r.name}-${r.lat}-${r.lon}-${i}`}>
                  <td>{r.name ?? '—'}</td>
                  <td>{r.region ?? '—'}</td>
                  <td>{r.country ?? '—'}</td>
                  <td className="location-coords">
                    {r.lat != null && r.lon != null ? `${r.lat}, ${r.lon}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
        <p className="page-muted">No locations found. Try a different query.</p>
      )}

      {!loading && query.trim().length < 2 && (
        <p className="page-muted">Type at least 2 characters to search locations.</p>
      )}
    </div>
  )
}
