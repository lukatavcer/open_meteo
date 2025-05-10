// Location service for handling location-related API calls
// Separating location services from weather services for better organization

import { HttpClient } from "./httpClient.ts";
import { API_CONFIG, API_DEFAULTS } from "../config/api";
import { Location } from "../types/weather";
import logger from "../utils/logger";

/**
 * Searches for cities by name using OpenMeteo's Geocoding API
 * @param query The search query (city name)
 * @returns Promise with an array of location results
 */
export const searchCities = async (query: string): Promise<Location[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const url = `${API_CONFIG.geocoding.baseUrl}${API_CONFIG.geocoding.search}`;
    const params = {
      name: query,
      count: 5,
      language: API_DEFAULTS.language,
      format: API_DEFAULTS.format,
    };

    const data = await HttpClient.get<any>(url, { params });

    // Map the API response to our Location interface
    return data.results
      ? data.results.map((item: any) => ({
          city: item.name || "Unknown",
          country: item.country || "Unknown",
          latitude: item.latitude,
          longitude: item.longitude,
        }))
      : [];
  } catch (error) {
    logger.error("Error searching for cities:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to search for cities");
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
    // The Open-Meteo Geocoding API does not support reverse geocoding (lat/lon → city name),
    // so we fetch it from the openstreetmap.
    const url = `${API_CONFIG.nominatim.baseUrl}${API_CONFIG.nominatim.reverse}`;
    const params = {
      "format": API_DEFAULTS.format,
      "lat": latitude,
      "lon": longitude,
      "zoom": 10,
      "accept-language": API_DEFAULTS.language,
    };

    const data = await HttpClient.get<any>(url, { params });

    return {
      city: data.address.city || data.address.town || data.address.municipality || "Unknown",
      country: data.address.country || "Unknown",
      latitude,
      longitude,
    };
  } catch (error) {
    logger.error("Error fetching location info:", error);
    // Return default location info if geocoding fails
    return {
      city: "Unknown",
      country: "Unknown",
      latitude,
      longitude,
    };
  }
};
