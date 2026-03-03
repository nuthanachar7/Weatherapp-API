# WeatherStack — Weather SaaS

**Live:** [weatherapp-api-delta.vercel.app](https://weatherapp-api-delta.vercel.app)

A React weather app built with **glassmorphism UI** and the [Weatherstack API](https://weatherstack.com/documentation). It supports **current** weather, **forecast**, **historical**, **marine**, and **location** lookup with search and filter.

## Features

- **Current** — Real-time weather for any location (city, ZIP, lat/lon, IP).
- **Forecast** — Up to 14-day forecast (Professional plan).
- **Historical** — Past weather by single date or date range (Standard plan+).
- **Marine** — Live and historical marine weather by latitude/longitude (Standard plan+).
- **Location** — Search and filter locations (autocomplete); use results in other sections.
- **Units** — Metric, Fahrenheit, Scientific.
- **Glassmorphism** — Frosted glass panels, warm amber/gold accents, no default AI-style colors.

## Setup

1. **Get an API key**  
   Sign up at [weatherstack.com](https://weatherstack.com/signup/free) and copy your access key.

2. **Configure env**  
   Create a `.env` in the project root (see `.env.example`):

   ```env
   VITE_WEATHERSTACK_ACCESS_KEY=your_access_key_here
   ```

3. **Install and run**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

## Deploy on Vercel

1. Import the repo in [Vercel](https://vercel.com).
2. **Add the API key** (required or the app will show “Set the API key in Vercel”):
   - Open your project on Vercel → **Settings** → **Environment Variables**.
   - Click **Add** (or **Add New**).
   - **Key:** `WEATHERSTACK_ACCESS_KEY` (exactly this name).
   - **Value:** your Weatherstack access key from [weatherstack.com/signup/free](https://weatherstack.com/signup/free).
   - **Environment:** tick **Production** (and **Preview** if you use preview URLs).
   - Save.
3. **Redeploy:** **Deployments** → open the **⋯** menu on the latest deployment → **Redeploy**. Wait for the build to finish, then open your app URL again.

## API Reference

- Base URL: `https://api.weatherstack.com/`
- Endpoints: `/current`, `/forecast`, `/historical`, `/marine`, `/past-marine`, `/autocomplete`
- Full docs: [weatherstack.com/documentation](https://weatherstack.com/documentation)

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
