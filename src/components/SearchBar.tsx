import { useState, useRef, useEffect } from 'react'
import './SearchBar.css'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
  suggestions?: Array<{ name?: string; country?: string; region?: string; lat?: string; lon?: string }>
  onSelectSuggestion?: (item: { name?: string; country?: string; lat?: string; lon?: string }) => void
  loading?: boolean
  label?: string
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'City, ZIP, or coordinates (e.g. 40.71,-74.00)',
  suggestions = [],
  onSelectSuggestion,
  loading = false,
  label = 'Location',
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHighlight(-1)
  }, [suggestions])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!focused || suggestions.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlight((h) => (h < suggestions.length - 1 ? h + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlight((h) => (h > 0 ? h - 1 : suggestions.length - 1))
      } else if (e.key === 'Enter' && highlight >= 0 && suggestions[highlight] && onSelectSuggestion) {
        e.preventDefault()
        onSelectSuggestion(suggestions[highlight])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focused, suggestions, highlight, onSelectSuggestion])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setFocused(false)
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showSuggestions = focused && suggestions.length > 0

  return (
    <div className="search-bar" ref={wrapperRef}>
      {label && (
        <label className="search-bar-label" htmlFor="search-input">
          {label}
        </label>
      )}
      <div className="search-bar-input-wrap glass">
        <input
          id="search-input"
          type="text"
          className="search-bar-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
        />
        <button
          type="button"
          className="search-bar-btn"
          onClick={() => onSearch(value)}
          disabled={loading || !value.trim()}
          aria-label="Search"
        >
          {loading ? <span className="search-bar-spinner" /> : 'Search'}
        </button>
      </div>
      {showSuggestions && (
        <ul
          id="search-suggestions"
          className="search-bar-suggestions glass"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.name}-${s.lat}-${s.lon}-${i}`}
              role="option"
              aria-selected={i === highlight}
              className={`search-bar-suggestion ${i === highlight ? 'highlight' : ''}`}
              onMouseDown={() => onSelectSuggestion?.(s)}
              onMouseEnter={() => setHighlight(i)}
            >
              <span className="suggestion-name">{s.name}</span>
              {(s.region || s.country) && (
                <span className="suggestion-meta">
                  {[s.region, s.country].filter(Boolean).join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
