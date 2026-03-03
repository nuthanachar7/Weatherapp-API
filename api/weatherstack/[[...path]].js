/**
 * Vercel serverless proxy for Weatherstack API.
 * Injects API key from env so the key is not exposed in the client.
 * Handles CORS by running the request server-side.
 */

const WEATHERSTACK_BASE = 'https://api.weatherstack.com'

export default async function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path || '')
  const key = (process.env.WEATHERSTACK_ACCESS_KEY || process.env.VITE_WEATHERSTACK_ACCESS_KEY || '').trim()

  if (!key) {
    res.status(500).json({
      success: false,
      error: {
        code: 101,
        type: 'missing_access_key',
        info: 'Set the API key in Vercel: 1) Open vercel.com → your project (Weatherapp-API). 2) Settings → Environment Variables. 3) Add: Name = WEATHERSTACK_ACCESS_KEY, Value = your key from https://weatherstack.com/signup/free. 4) Choose Production (and Preview if needed). 5) Save. 6) Deployments → ⋮ on latest → Redeploy. Wait for the new deployment, then refresh this page.',
      },
    })
    return
  }

  const endpoint = path || 'current'
  const query = new URLSearchParams(req.query)
  query.delete('path')
  query.set('access_key', key)

  const url = `${WEATHERSTACK_BASE}/${endpoint}?${query.toString()}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(502).json({
      success: false,
      error: { info: err.message || 'Proxy request failed' },
    })
  }
}
