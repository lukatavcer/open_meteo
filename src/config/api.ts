// API configuration file
// Centralizes all API endpoints and settings for better maintainability

export const API_CONFIG = {
  // Open-Meteo API endpoints
  openMeteo: {
    baseUrl: "https://api.open-meteo.com/v1",
    forecast: "/forecast",
  },

  // Open-Meteo Geocoding API
  geocoding: {
    baseUrl: "https://geocoding-api.open-meteo.com/v1",
    search: "/search",
  },

  // OpenStreetMap Nominatim API for reverse geocoding
  nominatim: {
    baseUrl: "https://nominatim.openstreetmap.org",
    reverse: "/reverse",
  },
};

export const API_DEFAULTS = {
  language: "en",
  format: "json",
};
