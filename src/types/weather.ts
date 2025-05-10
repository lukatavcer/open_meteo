/**
 * Type definitions for weather data
 * These interfaces define the structure of data used throughout the application
 */

/**
 * The current weather data interface
 * Represents the current weather conditions at a location
 */
export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  weatherCondition: string;
  windSpeed?: number;
  humidity?: number;
  location: Location;
}

/**
 * Forecast data interfaces
 */

/**
 * Single-day forecast data
 * Represents weather forecast for a specific day
 */
export interface ForecastDay {
  date: string;
  maxTemperature: number;
  minTemperature: number;
  weatherCode: number;
  weatherCondition: string;
}

/**
 * Complete forecast data
 * Contains forecast for multiple days and location information
 */
export interface ForecastData {
  days: ForecastDay[];
  location: Location;
}

/**
 * Location interface
 * Represents geographical location information
 */
export interface Location {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}
