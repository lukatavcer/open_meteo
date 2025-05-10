import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchCurrentWeather, fetchForecast } from "../../../src/api/weatherService";
import { HttpClient } from "../../../src/api/httpClient";
import * as locationService from "../../../src/api/locationService";
import { API_CONFIG } from "../../../src/config/api";
import * as weatherConstants from "../../../src/constants/weather";
import logger from "../../../src/utils/logger";

// Mock dependencies
vi.mock("../../../src/api/httpClient", () => ({
  HttpClient: {
    get: vi.fn(),
  },
}));

vi.mock("../../../src/api/locationService", () => ({
  getLocationInfo: vi.fn(),
}));

vi.mock("../../../src/utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("Weather Service", () => {
  const mockLocation = {
    city: "Berlin",
    country: "Germany",
    latitude: 52.52,
    longitude: 13.41,
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Mock getWeatherCondition to return a predictable value
    vi.spyOn(weatherConstants, "getWeatherCondition").mockImplementation(
      code => `Weather condition for code ${code}`
    );

    // Mock getLocationInfo to return a predictable location
    vi.mocked(locationService.getLocationInfo).mockResolvedValue(mockLocation);
  });

  describe("fetchCurrentWeather", () => {
    it("should fetch current weather data successfully", async () => {
      // Mock API response
      const mockApiResponse = {
        current: {
          temperature_2m: 22.5,
          weather_code: 0,
          wind_speed_10m: 5.2,
          relative_humidity_2m: 65,
        },
      };

      vi.mocked(HttpClient.get).mockResolvedValue(mockApiResponse);

      // Call the function
      const result = await fetchCurrentWeather(52.52, 13.41);

      // Verify HttpClient.get was called with correct parameters
      expect(HttpClient.get).toHaveBeenCalledWith(
        `${API_CONFIG.openMeteo.baseUrl}${API_CONFIG.openMeteo.forecast}`,
        {
          params: {
            latitude: 52.52,
            longitude: 13.41,
            current: "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m",
          },
        }
      );

      // Verify getLocationInfo was called with correct coordinates
      expect(locationService.getLocationInfo).toHaveBeenCalledWith(52.52, 13.41);

      // Verify the result
      expect(result).toEqual({
        temperature: 22.5,
        weatherCode: 0,
        weatherCondition: "Weather condition for code 0",
        windSpeed: 5.2,
        humidity: 65,
        location: mockLocation,
      });
    });

    it("should handle errors when fetching current weather", async () => {
      // Mock API error
      const mockError = new Error("API error");
      vi.mocked(HttpClient.get).mockRejectedValue(mockError);

      // Expect the function to throw an error
      await expect(fetchCurrentWeather(52.52, 13.41)).rejects.toThrow("API error");

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith("Error fetching current weather:", mockError);
    });
  });

  describe("fetchForecast", () => {
    // Mock for Date that we can restore after tests
    let originalDate;

    beforeEach(() => {
      // Save the original Date constructor
      originalDate = global.Date;
    });

    afterEach(() => {
      // Restore original Date constructor after each test
      global.Date = originalDate;
    });

    it("should fetch forecast data successfully", async () => {
      // Mock date for consistent testing
      const mockDate = new Date("2023-05-10");
      vi.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Mock API response
      const mockApiResponse = {
        daily: {
          time: ["2023-05-10", "2023-05-11", "2023-05-12", "2023-05-13", "2023-05-14"],
          temperature_2m_max: [25.1, 26.2, 24.3, 22.4, 23.5],
          temperature_2m_min: [15.1, 16.2, 14.3, 12.4, 13.5],
          weather_code: [0, 1, 2, 3, 45],
        },
      };

      vi.mocked(HttpClient.get).mockResolvedValue(mockApiResponse);

      // Call the function
      const result = await fetchForecast(52.52, 13.41);

      // Verify HttpClient.get was called with correct parameters
      expect(HttpClient.get).toHaveBeenCalledWith(
        `${API_CONFIG.openMeteo.baseUrl}${API_CONFIG.openMeteo.forecast}`,
        {
          params: {
            latitude: 52.52,
            longitude: 13.41,
            daily: "temperature_2m_max,temperature_2m_min,weather_code",
            start_date: "2023-05-10",
            end_date: "2023-05-14",
          },
        }
      );

      // Verify getLocationInfo was called with correct coordinates
      expect(locationService.getLocationInfo).toHaveBeenCalledWith(52.52, 13.41);

      // Verify the result
      expect(result).toEqual({
        days: [
          {
            date: "2023-05-10",
            maxTemperature: 25.1,
            minTemperature: 15.1,
            weatherCode: 0,
            weatherCondition: "Weather condition for code 0",
          },
          {
            date: "2023-05-11",
            maxTemperature: 26.2,
            minTemperature: 16.2,
            weatherCode: 1,
            weatherCondition: "Weather condition for code 1",
          },
          {
            date: "2023-05-12",
            maxTemperature: 24.3,
            minTemperature: 14.3,
            weatherCode: 2,
            weatherCondition: "Weather condition for code 2",
          },
          {
            date: "2023-05-13",
            maxTemperature: 22.4,
            minTemperature: 12.4,
            weatherCode: 3,
            weatherCondition: "Weather condition for code 3",
          },
          {
            date: "2023-05-14",
            maxTemperature: 23.5,
            minTemperature: 13.5,
            weatherCode: 45,
            weatherCondition: "Weather condition for code 45",
          },
        ],
        location: mockLocation,
      });
    });

    it("should handle errors when fetching forecast", async () => {
      // Mock date for consistent testing
      const mockDate = new Date("2023-05-10");
      vi.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Mock API error
      const mockError = new Error("API error");
      vi.mocked(HttpClient.get).mockRejectedValue(mockError);

      // Expect the function to throw an error
      await expect(fetchForecast(52.52, 13.41)).rejects.toThrow("API error");

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith("Error fetching forecast:", mockError);
    });
  });
});
