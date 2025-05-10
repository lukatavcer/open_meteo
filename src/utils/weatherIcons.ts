// Weather icon utilities

// Map weather codes to icon names
export const weatherCodeToIconMap: Record<number, string> = {
  0: "clear-day", // Clear sky
  1: "partly-cloudy-day", // Mainly clear
  2: "partly-cloudy-day", // Partly cloudy
  3: "cloudy", // Overcast
  45: "fog", // Fog
  48: "fog", // Depositing rime fog
  51: "drizzle", // Light drizzle
  53: "drizzle", // Moderate drizzle
  55: "drizzle", // Dense drizzle
  56: "sleet", // Light freezing drizzle
  57: "sleet", // Dense freezing drizzle
  61: "rain", // Slight rain
  63: "rain", // Moderate rain
  65: "rain", // Heavy rain
  66: "sleet", // Light freezing rain
  67: "sleet", // Heavy freezing rain
  71: "snow", // Slight snow fall
  73: "snow", // Moderate snow fall
  75: "snow", // Heavy snow fall
  77: "snow", // Snow grains
  80: "partly-cloudy-day-rain", // Slight rain showers
  81: "partly-cloudy-day-rain", // Moderate rain showers
  82: "partly-cloudy-day-rain", // Violent rain showers
  85: "snow-showers-day", // Slight snow showers
  86: "snow-showers-day", // Heavy snow showers
  95: "thunderstorms-day", // Thunderstorm
  96: "thunderstorms-day-rain", // Thunderstorm with slight hail
  99: "thunderstorms-day-rain", // Thunderstorm with heavy hail
};

/**
 * Get the URL for a weather icon based on the weather code
 * @param weatherCode - The weather code from the API
 * @returns The URL to the corresponding weather icon
 */
export const getWeatherIconUrl = (weatherCode: number): string => {
  const iconName = weatherCodeToIconMap[weatherCode] || "clear-day";
  return `/open_meteo/assets/icons/weather/svg/${iconName}.svg`;
};
