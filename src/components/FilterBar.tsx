import './FilterBar.css'

export interface FilterBarProps {
  unit: 'm' | 'f' | 's'
  onUnitChange: (u: 'm' | 'f' | 's') => void
  extraFilters?: React.ReactNode
}

export default function FilterBar({ unit, onUnitChange, extraFilters }: FilterBarProps) {
  return (
    <div className="filter-bar glass">
      <div className="filter-group">
        <span className="filter-label">Units</span>
        <select
          className="filter-select"
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as 'm' | 'f' | 's')}
          aria-label="Temperature and wind units"
        >
          <option value="m">Metric (°C, km/h)</option>
          <option value="f">Fahrenheit (°F, mph)</option>
          <option value="s">Scientific (K, m/s)</option>
        </select>
      </div>
      {extraFilters}
    </div>
  )
}
