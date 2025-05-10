import { CurrentWeather, ForecastData, ForecastDay } from "../types/weather";
import { HttpClient } from "./httpClient.ts";
import { API_CONFIG } from "../config/api";
import { getLocationInfo } from "./locationService";
import { getWeatherCondition } from "../constants/weather";
import logger from "../utils/logger";

// Re-export location services for backward compatibility
export { searchCities, getUserLocation, getLocationInfo } from "./locationService";

/**
 * Fetches current weather data from the Open-Meteo API
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with current weather data
 */
export const fetchCurrentWeather = async (
  latitude: number,
  longitude: number
): Promise<CurrentWeather> => {
  try {
    // Fetch location information
    const location = await getLocationInfo(latitude, longitude);

    // Fetch weather data from Open-Meteo API
    const url = `${API_CONFIG.openMeteo.baseUrl}${API_CONFIG.openMeteo.forecast}`;
    const params = {
      latitude,
      longitude,
      current: "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m",
    };

    const data = await HttpClient.get<any>(url, { params });

    const weatherCode = data.current.weather_code;

    return {
      temperature: data.current.temperature_2m,
      weatherCode,
      weatherCondition: getWeatherCondition(weatherCode),
      windSpeed: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m,
      location,
    };
  } catch (error) {
    logger.error("Error fetching current weather:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to fetch weather data");
  }
};

/**
 * Fetches 5-day forecast data from the Open-Meteo API
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with forecast data for the next 5 days
 */
export const fetchForecast = async (latitude: number, longitude: number): Promise<ForecastData> => {
  try {
    // Fetch location information
    const location = await getLocationInfo(latitude, longitude);

    // Get the current date
    const today = new Date();

    // Format dates for API request (YYYY-MM-DD)
    const formatDate = (date: Date): string => {
      return date.toISOString().split("T")[0];
    };

    const startDate = formatDate(today);

    // Calculate end date (today + 5 days)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 4); // 5 days including today
    const endDateStr = formatDate(endDate);

    // Fetch forecast data from Open-Meteo API
    const url = `${API_CONFIG.openMeteo.baseUrl}${API_CONFIG.openMeteo.forecast}`;
    const params = {
      latitude,
      longitude,
      daily: "temperature_2m_max,temperature_2m_min,weather_code",
      start_date: startDate,
      end_date: endDateStr,
    };

    const data = await HttpClient.get<any>(url, { params });

    // Process the forecast data
    const forecastDays: ForecastDay[] = [];

    for (let i = 0; i < data.daily.time.length; i++) {
      const weatherCode = data.daily.weather_code[i];
      forecastDays.push({
        date: data.daily.time[i],
        maxTemperature: data.daily.temperature_2m_max[i],
        minTemperature: data.daily.temperature_2m_min[i],
        weatherCode,
        weatherCondition: getWeatherCondition(weatherCode),
      });
    }

    return {
      days: forecastDays,
      location,
    };
  } catch (error) {
    logger.error("Error fetching forecast:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to fetch forecast data");
  }
};
