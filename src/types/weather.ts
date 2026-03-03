export type Units = 'm' | 'f' | 's'

export interface LocationResult {
  name?: string
  country?: string
  region?: string
  lat?: string
  lon?: string
  timezone_id?: string
  type?: string
}

export interface Astro {
  sunrise: string
  sunset: string
  moonrise?: string
  moonset?: string
  moon_phase?: string
  moon_illumination?: number
}

export interface CurrentWeather {
  observation_time: string
  temperature: number
  weather_code: number
  weather_icons: string[]
  weather_descriptions: string[]
  wind_speed: number
  wind_degree: number
  wind_dir: string
  pressure: number
  precip: number
  humidity: number
  cloudcover: number
  feelslike: number
  uv_index: number
  visibility: number
  astro?: Astro
  air_quality?: Record<string, string>
}

export interface DayForecast {
  date: string
  date_epoch: number
  astro: Astro
  mintemp: number
  maxtemp: number
  avgtemp: number
  totalsnow?: number
  sunhour: number
  uv_index: number
  hourly?: HourlyWeather[]
}

export interface HourlyWeather {
  time: string
  temperature: number
  wind_speed: number
  wind_degree: number
  wind_dir: string
  weather_code: number
  weather_icons: string[]
  weather_descriptions: string[]
  precip: number
  humidity: number
  visibility: number
  pressure: number
  cloudcover: number
  feelslike: number
  chanceofrain?: number
  uv_index?: number
}
