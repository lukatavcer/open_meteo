import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchCities, getUserLocation, getLocationInfo } from "../../../src/api/locationService";
import { HttpClient } from "../../../src/api/httpClient";
import { API_CONFIG, API_DEFAULTS } from "../../../src/config/api";
import logger from "../../../src/utils/logger";

// Mock dependencies
vi.mock("../../../src/api/httpClient", () => ({
  HttpClient: {
    get: vi.fn(),
  },
}));

vi.mock("../../../src/utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("Location Service", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  describe("searchCities", () => {
    it("should return empty array for empty query", async () => {
      const result = await searchCities("");
      expect(result).toEqual([]);
      expect(HttpClient.get).not.toHaveBeenCalled();
    });

    it("should search cities successfully", async () => {
      // Mock API response
      const mockApiResponse = {
        results: [
          {
            name: "Berlin",
            country: "Germany",
            latitude: 52.52,
            longitude: 13.41,
          },
          {
            name: "Berlin",
            country: "United States",
            latitude: 44.47,
            longitude: -71.18,
          },
        ],
      };

      vi.mocked(HttpClient.get).mockResolvedValue(mockApiResponse);

      // Call the function
      const result = await searchCities("Berlin");

      // Verify HttpClient.get was called with correct parameters
      expect(HttpClient.get).toHaveBeenCalledWith(
        `${API_CONFIG.geocoding.baseUrl}${API_CONFIG.geocoding.search}`,
        {
          params: {
            name: "Berlin",
            count: 5,
            language: API_DEFAULTS.language,
            format: API_DEFAULTS.format,
          },
        }
      );

      // Verify the result
      expect(result).toEqual([
        {
          city: "Berlin",
          country: "Germany",
          latitude: 52.52,
          longitude: 13.41,
        },
        {
          city: "Berlin",
          country: "United States",
          latitude: 44.47,
          longitude: -71.18,
        },
      ]);
    });

    it("should handle missing fields in API response", async () => {
      // Mock API response with missing fields
      const mockApiResponse = {
        results: [
          {
            latitude: 52.52,
            longitude: 13.41,
          },
        ],
      };

      vi.mocked(HttpClient.get).mockResolvedValue(mockApiResponse);

      // Call the function
      const result = await searchCities("Berlin");

      // Verify the result handles missing fields
      expect(result).toEqual([
        {
          city: "Unknown",
          country: "Unknown",
          latitude: 52.52,
          longitude: 13.41,
        },
      ]);
    });

    it("should handle empty results from API", async () => {
      // Mock API response with no results
      const mockApiResponse = {};

      vi.mocked(HttpClient.get).mockResolvedValue(mockApiResponse);

      // Call the function
      const result = await searchCities("NonExistentCity");

      // Verify the result is an empty array
      expect(result).toEqual([]);
    });

    it("should handle errors when searching cities", async () => {
      // Mock API error
      const mockError = new Error("API error");
      vi.mocked(HttpClient.get).mockRejectedValue(mockError);

      // Expect the function to throw an error
      await expect(searchCities("Berlin")).rejects.toThrow("API error");

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith("Error searching for cities:", mockError);
    });
  });

  describe("getUserLocation", () => {
    it("should get user location successfully", async () => {
      // Mock navigator.geolocation
      const mockGeolocation = {
        getCurrentPosition: vi.fn().mockImplementation(success => {
          success({
            coords: {
              latitude: 52.52,
              longitude: 13.41,
            },
          });
        }),
      };

      // Replace navigator.geolocation with mock
      const originalGeolocation = global.navigator.geolocation;
      Object.defineProperty(global.navigator, "geolocation", {
        value: mockGeolocation,
        writable: true,
      });

      // Call the function
      const result = await getUserLocation();

      // Verify the result
      expect(result).toEqual({
        latitude: 52.52,
        longitude: 13.41,
      });

      // Restore original geolocation
      Object.defineProperty(global.navigator, "geolocation", {
        value: originalGeolocation,
        writable: true,
      });
    });

    it("should handle errors when geolocation is not supported", async () => {
      // Mock navigator without geolocation
      const originalNavigator = global.navigator;
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true,
      });

      // Expect the function to throw an error
      await expect(getUserLocation()).rejects.toThrow(
        "Geolocation is not supported by your browser"
      );

      // Restore original navigator
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        writable: true,
      });
    });

    it("should handle errors when getting user location", async () => {
      // Mock navigator.geolocation with error
      const mockGeolocation = {
        getCurrentPosition: vi.fn().mockImplementation((success, error) => {
          error({ message: "User denied geolocation" });
        }),
      };

      // Replace navigator.geolocation with mock
      const originalGeolocation = global.navigator.geolocation;
      Object.defineProperty(global.navigator, "geolocation", {
        value: mockGeolocation,
        writable: true,
      });

      // Expect the function to throw an error
      await expect(getUserLocation()).rejects.toThrow(
        "Failed to get location: User denied geolocation"
      );

      // Restore original geolocation
      Object.defineProperty(global.navigator, "geolocation", {
        value: originalGeolocation,
        writable: true,
      });
    });
  });

  describe("getLocationInfo", () => {
    it("should get location info successfully", async () => {
      // Mock API response
      const mockApiResponse = {
        address: {
          city: "Berlin",
          country: "Germany",
        },
      };

      vi.mocked(HttpClient.get).mockResolvedValue(mockApiResponse);

      // Call the function
      const result = await getLocationInfo(52.52, 13.41);

      // Verify HttpClient.get was called with correct parameters
      expect(HttpClient.get).toHaveBeenCalledWith(
        `${API_CONFIG.nominatim.baseUrl}${API_CONFIG.nominatim.reverse}`,
        {
          params: {
            "format": API_DEFAULTS.format,
            "lat": 52.52,
            "lon": 13.41,
            "zoom": 10,
            "accept-language": API_DEFAULTS.language,
          },
        }
      );

      // Verify the result
      expect(result).toEqual({
        city: "Berlin",
        country: "Germany",
        latitude: 52.52,
        longitude: 13.41,
      });
    });

    it("should handle alternative city fields in API response", async () => {
      // Mock API response with town instead of city
      const mockApiResponse = {
        address: {
          town: "Small Town",
          country: "Germany",
        },
      };

      vi.mocked(HttpClient.get).mockResolvedValue(mockApiResponse);

      // Call the function
      const result = await getLocationInfo(52.52, 13.41);

      // Verify the result uses town field
      expect(result).toEqual({
        city: "Small Town",
        country: "Germany",
        latitude: 52.52,
        longitude: 13.41,
      });
    });

    it("should handle missing fields in API response", async () => {
      // Mock API response with missing fields
      const mockApiResponse = {
        address: {},
      };

      vi.mocked(HttpClient.get).mockResolvedValue(mockApiResponse);

      // Call the function
      const result = await getLocationInfo(52.52, 13.41);

      // Verify the result handles missing fields
      expect(result).toEqual({
        city: "Unknown",
        country: "Unknown",
        latitude: 52.52,
        longitude: 13.41,
      });
    });

    it("should handle errors when getting location info", async () => {
      // Mock API error
      const mockError = new Error("API error");
      vi.mocked(HttpClient.get).mockRejectedValue(mockError);

      // Call the function (should not throw)
      const result = await getLocationInfo(52.52, 13.41);

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith("Error fetching location info:", mockError);

      // Verify default location is returned
      expect(result).toEqual({
        city: "Unknown",
        country: "Unknown",
        latitude: 52.52,
        longitude: 13.41,
      });
    });
  });
});
