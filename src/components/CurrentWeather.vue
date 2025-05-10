<template>
  <div class="weather-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading weather data...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="loadWeatherData()" class="retry-button">Try Again</button>
    </div>

    <div v-else-if="weather" class="weather-card">
      <div class="location-info">
        <h3 class="location-title">Current weather in</h3>
        <h2 class="location-name">{{ weather.location.city }}, {{ weather.location.country }}</h2>
      </div>

      <div class="weather-info">
        <div class="weather-icon">
          <img :src="getWeatherIconUrl(weather.weatherCode)" :alt="weather.weatherCondition" />
        </div>

        <div class="weather-details">
          <div class="temperature">{{ Math.round(weather.temperature) }}°C</div>
          <div class="condition">
            {{ weather.weatherCondition }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, defineProps } from "vue";
  import { CurrentWeather, Location } from "../types/weather";
  import { getUserLocation, fetchCurrentWeather } from "../api/weatherService";
  import { getWeatherIconUrl } from "../utils/weatherIcons";

  // Props
  const props = defineProps<{
    selectedLocation?: Location | null;
  }>();

  // State
  const weather = ref<CurrentWeather | null>(null);
  const loading = ref<boolean>(true);
  const error = ref<string | null>(null);

  // Load weather data
  const loadWeatherData = async (location?: Location) => {
    loading.value = true;
    error.value = null;

    try {
      let latitude: number;
      let longitude: number;

      if (location) {
        // Use provided location
        latitude = location.latitude;
        longitude = location.longitude;
      } else {
        // Get user's location as fallback
        const userLocation = await getUserLocation();
        latitude = userLocation.latitude;
        longitude = userLocation.longitude;
      }

      // Fetch current weather data
      weather.value = await fetchCurrentWeather(latitude, longitude);
    } catch (err: any) {
      console.error("Error loading weather data:", err);
      error.value = err.message || "Failed to load weather data";
    } finally {
      loading.value = false;
    }
  };

  // Watch for changes in selected location
  watch(
    () => props.selectedLocation,
    newLocation => {
      if (newLocation) {
        loadWeatherData(newLocation);
      }
    },
    { immediate: true }
  );

  // Load weather data when the component is mounted (if no location is selected)
  onMounted(() => {
    if (!props.selectedLocation) {
      loadWeatherData();
    }
  });
</script>

<style scoped>
  .weather-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: #666;
    font-size: 1rem;
  }

  .error-container {
    background-color: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .error-message {
    color: #e74c3c;
    margin-bottom: 1rem;
  }

  .retry-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .retry-button:hover {
    background-color: #2980b9;
  }

  .weather-card {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .location-info {
    background-color: #3498db;
    color: white;
    padding: 1rem;
    text-align: center;
  }

  .location-title {
    font-size: 1.2rem;
    font-weight: 400;
  }

  .location-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .weather-info {
    display: flex;
    align-items: center;
    padding: 1.5rem;
  }

  .weather-icon {
    flex: 0 0 100px;
  }

  .weather-icon img {
    width: 100%;
    height: auto;
  }

  .weather-details {
    flex: 1;
    padding-left: 1.5rem;
  }

  .temperature {
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .condition {
    font-size: 1.2rem;
    color: #666;
  }
</style>
