/**
 * Weatherstack API client
 * Base URL: https://api.weatherstack.com/
 * Docs: https://weatherstack.com/documentation
 */

// Always use proxy: in dev (Vite proxy), in production (Vercel serverless function). Avoids CORS and keeps key server-side in prod.
const BASE_URL = '/api/weatherstack'

const API_KEY_HELP =
  import.meta.env.DEV
    ? 'Add your Weatherstack API key: create a file named .env in the project root (same folder as package.json) with exactly this line: VITE_WEATHERSTACK_ACCESS_KEY=your_key_here — then restart the dev server (stop and run npm run dev again). Get a free key at https://weatherstack.com/signup/free'
    : 'Add your API key in Vercel: Project → Settings → Environment Variables → add VITE_WEATHERSTACK_ACCESS_KEY (or WEATHERSTACK_ACCESS_KEY), then redeploy. Get a free key at https://weatherstack.com/signup/free'

const RATE_LIMIT_MSG =
  "You've hit the API rate limit (free plan: 100 requests/month). Wait until next month for the quota to reset, or upgrade at https://weatherstack.com/pricing. To save requests, use the search box and click Search only when needed — location suggestions are disabled on Current to preserve your quota."

function isRateLimitError(data: { error?: { code?: number; info?: string } }): boolean {
  const code = data.error?.code
  const info = (data.error?.info ?? '').toLowerCase()
  return code === 429 || info.includes('rate') || info.includes('limitation')
}

function getAccessKey(): string | null {
  const key = (import.meta.env.VITE_WEATHERSTACK_ACCESS_KEY as string)?.trim()
  return key || null
}

function buildParams(params: Record<string, string | number | undefined>): string {
  const cleaned: Record<string, string> = {}
  // In production we use the Vercel proxy; it injects the key. In dev, we send the key so Vite proxy can forward.
  const key = getAccessKey()
  if (key) cleaned.access_key = key
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') cleaned[k] = String(v)
  }
  const qs = new URLSearchParams(cleaned).toString()
  if (!key && import.meta.env.DEV) {
    throw new Error(API_KEY_HELP)
  }
  return qs
}

export type Units = 'm' | 'f' | 's'

// Current weather API response (explicit type avoids TS circular reference in cache)
export interface CurrentWeatherResponse {
  request?: { type?: string; query?: string; unit?: string }
  location?: { name?: string; country?: string; region?: string; lat?: string; lon?: string; localtime?: string }
  current?: {
    temperature?: number
    feelslike?: number
    humidity?: number
    wind_speed?: number
    wind_dir?: string
    pressure?: number
    uv_index?: number
    visibility?: number
    weather_icons?: string[]
    weather_descriptions?: string[]
  }
}

// Simple in-memory cache for current weather (saves quota on free plan)
const currentCache = new Map<string, { data: CurrentWeatherResponse; at: number }>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

// Current weather
export async function getCurrentWeather(query: string, units: Units = 'm'): Promise<CurrentWeatherResponse> {
  const key = `${query.trim().toLowerCase()}|${units}`
  const cached = currentCache.get(key)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data

  const qs = buildParams({ query, units })
  const res = await fetch(`${BASE_URL}/current?${qs}`)
  const data = await res.json()
  if (!data.success && data.error) {
    if (data.error.code === 101) throw new Error(API_KEY_HELP)
    if (isRateLimitError(data)) throw new Error(RATE_LIMIT_MSG)
    throw new Error(data.error.info || 'Current weather request failed')
  }
  currentCache.set(key, { data: data as CurrentWeatherResponse, at: Date.now() })
  return data as CurrentWeatherResponse
}

// Forecast (Professional plan+) — 1–14 days
export async function getForecast(query: string, forecastDays: number = 7, units: Units = 'm', hourly = 0) {
  const qs = buildParams({ query, forecast_days: forecastDays, units, hourly })
  const res = await fetch(`${BASE_URL}/forecast?${qs}`)
  const data = await res.json()
  if (!data.success && data.error) {
    if (data.error.code === 101) throw new Error(API_KEY_HELP)
    if (isRateLimitError(data)) throw new Error(RATE_LIMIT_MSG)
    throw new Error(data.error.info || 'Forecast request failed')
  }
  return data
}

// Historical — single date or date range (max 60 days)
export async function getHistorical(
  query: string,
  options: {
    historical_date?: string
    historical_date_start?: string
    historical_date_end?: string
    hourly?: 0 | 1
    units?: Units
  } = {}
) {
  const { historical_date, historical_date_start, historical_date_end, hourly = 0, units = 'm' } = options
  const params: Record<string, string | number> = { query, units, hourly }
  if (historical_date) params.historical_date = historical_date
  if (historical_date_start) params.historical_date_start = historical_date_start
  if (historical_date_end) params.historical_date_end = historical_date_end
  const qs = buildParams(params)
  const res = await fetch(`${BASE_URL}/historical?${qs}`)
  const data = await res.json()
  if (!data.success && data.error) {
    if (data.error.code === 101) throw new Error(API_KEY_HELP)
    if (isRateLimitError(data)) throw new Error(RATE_LIMIT_MSG)
    throw new Error(data.error.info || 'Historical request failed')
  }
  return data
}

// Marine — lat/lon, optional hourly & tide
export async function getMarine(
  latitude: number,
  longitude: number,
  options: { hourly?: 0 | 1; tide?: 'yes' | 'no'; units?: Units } = {}
) {
  const { hourly = 0, tide = 'no', units = 'm' } = options
  const qs = buildParams({ latitude, longitude, hourly, tide, units })
  const res = await fetch(`${BASE_URL}/marine?${qs}`)
  const data = await res.json()
  if (!data.success && data.error) {
    if (data.error.code === 101) throw new Error(API_KEY_HELP)
    if (isRateLimitError(data)) throw new Error(RATE_LIMIT_MSG)
    throw new Error(data.error.info || 'Marine request failed')
  }
  return data
}

// Past marine — historical_date_start, optional historical_date_end (max 35 days)
export async function getPastMarine(
  latitude: number,
  longitude: number,
  historical_date_start: string,
  historical_date_end?: string,
  options: { hourly?: 0 | 1; tide?: 'yes' | 'no'; units?: Units } = {}
) {
  const { hourly = 0, tide = 'no', units = 'm' } = options
  const params: Record<string, string | number> = {
    latitude,
    longitude,
    historical_date_start,
    hourly,
    tide,
    units,
  }
  if (historical_date_end) params.historical_date_end = historical_date_end
  const qs = buildParams(params)
  const res = await fetch(`${BASE_URL}/past-marine?${qs}`)
  const data = await res.json()
  if (!data.success && data.error) {
    if (data.error.code === 101) throw new Error(API_KEY_HELP)
    if (isRateLimitError(data)) throw new Error(RATE_LIMIT_MSG)
    throw new Error(data.error.info || 'Past marine request failed')
  }
  return data
}

// Location autocomplete
export async function autocomplete(query: string) {
  if (!query.trim()) return []
  const qs = buildParams({ query: query.trim() })
  const res = await fetch(`${BASE_URL}/autocomplete?${qs}`)
  const data = await res.json()
  if (!data.success && data.error) {
    if (data.error.code === 101) throw new Error(API_KEY_HELP)
    if (isRateLimitError(data)) throw new Error(RATE_LIMIT_MSG)
    throw new Error(data.error.info || 'Autocomplete failed')
  }
  return data.results || []
}
