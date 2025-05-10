import {
  CurrentWeather,
  ForecastData,
  ForecastDay,
  Location,
  weatherCodeToCondition,
} from "../types/weather";

/**
 * Searches for cities by name using OpenStreetMap's Nominatim service
 * @param query The search query (city name)
 * @returns Promise with an array of location results
 */
export const searchCities = async (query: string): Promise<Location[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    // Using OpenStreetMap's Nominatim service for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`City search API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("City search results:", data);

    // Map the API response to our Location interface
    return data.map((item: any) => ({
      city:
        item.address.city ||
        item.address.town ||
        item.address.municipality ||
        item.address.village ||
        item.name ||
        "Unknown",
      country: item.address.country || "Unknown",
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  } catch (err: any) {
    console.error("Error searching for cities:", err);
    throw new Error(err.message || "Failed to search for cities");
  }
};

/**
 * Fetches the user's current location using the browser's Geolocation API
 * @returns Promise with the user's location (latitude and longitude)
 */
export const getUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(new Error(`Failed to get location: ${error.message}`));
      }
    );
  });
};

/**
 * Fetches location information (city, country) based on coordinates using reverse geocoding
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with location information
 */
export const getLocationInfo = async (latitude: number, longitude: number): Promise<Location> => {
  try {
    // Using OpenStreetMap's Nominatim service for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("location: ", data);

    return {
      city: data.address.city || data.address.town || data.address.municipality || "Unknown",
      country: data.address.country || "Unknown",
      latitude,
      longitude,
    };
  } catch (err: any) {
    console.error("Error fetching location info:", err);
    // Return default location info if geocoding fails
    return {
      city: "Unknown",
      country: "Unknown",
      latitude,
      longitude,
    };
  }
};

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
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("fetchCurrentWeather: ", data);
    const weatherCode = data.current.weather_code;

    return {
      temperature: data.current.temperature_2m,
      weatherCode,
      weatherCondition: weatherCodeToCondition[weatherCode] || "Unknown",
      location,
    };
  } catch (err: any) {
    console.error("Error fetching current weather:", err);
    throw new Error(err.message || "Failed to fetch weather data");
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

    // Get current date
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
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&start_date=${startDate}&end_date=${endDateStr}`
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("fetchForecast: ", data);

    // Process the forecast data
    const forecastDays: ForecastDay[] = [];

    for (let i = 0; i < data.daily.time.length; i++) {
      const weatherCode = data.daily.weather_code[i];
      forecastDays.push({
        date: data.daily.time[i],
        maxTemperature: data.daily.temperature_2m_max[i],
        minTemperature: data.daily.temperature_2m_min[i],
        weatherCode,
        weatherCondition: weatherCodeToCondition[weatherCode] || "Unknown",
      });
    }

    return {
      days: forecastDays,
      location,
    };
  } catch (err: any) {
    console.error("Error fetching forecast:", err);
    throw new Error(err.message || "Failed to fetch forecast data");
  }
};
