// Define weather-related interfaces

// Current weather data interface
export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  weatherCondition: string;
  location: Location;
}

// Forecast data interface
export interface ForecastDay {
  date: string;
  maxTemperature: number;
  minTemperature: number;
  weatherCode: number;
  weatherCondition: string;
}

export interface ForecastData {
  days: ForecastDay[];
  location: Location;
}

// Location interface
export interface Location {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Weather code mapping for conditions
export const weatherCodeToCondition: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};
