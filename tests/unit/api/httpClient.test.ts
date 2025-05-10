import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpClient, HttpRequestOptions } from "../../../src/api/httpClient";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock logger
vi.mock("../../../src/utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
  error: vi.fn(),
}));

describe("HttpClient", () => {
  beforeEach(() => {
    // Reset mock before each test
    mockFetch.mockReset();
  });

  describe("get method", () => {
    it("should make a GET request to the specified URL", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test data" }),
      });

      // Call the get method
      const result = await HttpClient.get("https://api.example.com/data");

      // Verify fetch was called with the correct URL and method
      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {
        method: "GET",
        headers: undefined,
      });

      // Verify the result
      expect(result).toEqual({ data: "test data" });
    });

    it("should include query parameters in the URL", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test data with params" }),
      });

      // Options with query parameters
      const options: HttpRequestOptions = {
        params: {
          param1: "value1",
          param2: 42,
          param3: true,
        },
      };

      // Call the get method with options
      await HttpClient.get("https://api.example.com/data", options);

      // Verify fetch was called with the correct URL including query parameters
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("https://api.example.com/data");
      expect(calledUrl).toContain("param1=value1");
      expect(calledUrl).toContain("param2=42");
      expect(calledUrl).toContain("param3=true");
    });

    it("should include custom headers in the request", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test data with headers" }),
      });

      // Options with headers
      const options: HttpRequestOptions = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer token123",
        },
      };

      // Call the get method with options
      await HttpClient.get("https://api.example.com/data", options);

      // Verify fetch was called with the correct headers
      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer token123",
        },
      });
    });

    it("should throw an error when the response is not OK", async () => {
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Expect the get method to throw an error
      await expect(HttpClient.get("https://api.example.com/notfound")).rejects.toThrow(
        "HTTP error! Status: 404"
      );
    });

    it("should handle network errors", async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Spy on console.error to verify error logging
      const loggerSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Expect the get method to throw an error
      await expect(HttpClient.get("https://api.example.com/error")).rejects.toThrow(
        "Network error"
      );

      // Clean up spy
      loggerSpy.mockRestore();
    });
  });

  describe("buildUrl method", () => {
    it("should return the base URL when no params are provided", async () => {
      // Mock successful response for a simple call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Call the get method without params
      await HttpClient.get("https://api.example.com/data");

      // Verify fetch was called with the exact URL
      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", expect.anything());
    });

    it("should skip null and undefined params", async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Options with some undefined/null params
      const options: HttpRequestOptions = {
        params: {
          param1: "value1",
          param2: undefined,
          param3: null as any,
        },
      };

      // Call the get method with options
      await HttpClient.get("https://api.example.com/data", options);

      // Verify fetch was called with URL containing only defined params
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("param1=value1");
      expect(calledUrl).not.toContain("param2");
      expect(calledUrl).not.toContain("param3");
    });
  });
});
