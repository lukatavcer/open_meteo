// HTTP client for making API requests
// Provides a consistent way to make HTTP requests and handle errors

import { error as logError } from "../utils/logger";

/**
 * Options for HTTP requests
 */
export interface HttpRequestOptions {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

/**
 * HTTP client for making API requests
 */
export class HttpClient {
  /**
   * Make a GET request
   * @param url URL to request
   * @param options Request options
   * @returns Promise with response data
   */
  static async get<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
    try {
      // Build URL with query parameters
      const urlWithParams = this.buildUrl(url, options.params);

      // Make request
      const response = await fetch(urlWithParams, {
        method: "GET",
        headers: options.headers,
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse response
      return await response.json();
    } catch (error) {
      // Handle and rethrow error
      await this.handleError(error, url);
      throw error;
    }
  }

  /**
   * Build URL with query parameters
   * @param baseUrl Base URL
   * @param params Query parameters
   * @returns URL with query parameters
   */
  private static buildUrl(
    baseUrl: string,
    params?: Record<string, string | number | boolean>
  ): string {
    if (!params) {
      return baseUrl;
    }

    const url = new URL(baseUrl);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Handle error from HTTP request
   * @param error Error object
   * @param url URL that was requested
   */
  private static async handleError(error: any, url: string): Promise<void> {
    // Log error for debugging
    logError(`Error making request to ${url}:`, error);

    // You could add more sophisticated error handling here,
    // such as logging to a service, retrying, etc.
  }
}
