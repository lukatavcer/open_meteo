<template>
  <div class="weather-details-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading weather details...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="loadWeatherData()" class="retry-button">Try Again</button>
    </div>

    <div v-else-if="weather" class="weather-details-card">
      <!-- Location Name (Large, main heading at the top) -->
      <div class="location-header">
        <h1 class="location-name">{{ weather.location.city }}, {{ weather.location.country }}</h1>
      </div>

      <div class="weather-content">
        <!-- Full-size Weather Icon -->
        <div class="weather-icon-large">
          <img :src="getWeatherIconUrl(weather.weatherCode)" :alt="weather.weatherCondition" />
        </div>

        <!-- Temperature (Large, centered value) -->
        <div class="temperature-large">{{ Math.round(weather.temperature) }}°C</div>

        <!-- Weather Condition -->
        <div class="weather-condition">{{ weather.weatherCondition }}</div>

        <!-- Additional Weather Details -->
        <div class="additional-details">
          <div class="detail-item">
            <span class="detail-label">Wind Speed</span>
            <span class="detail-value">{{ weather.windSpeed }} km/h</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Humidity</span>
            <span class="detail-value">{{ weather.humidity }}%</span>
          </div>
        </div>
      </div>

      <!-- Back button to return to home page -->
      <div class="back-button-container">
        <button @click="goBack" class="back-button">Back to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, defineProps, defineEmits } from "vue";
  import { CurrentWeather, Location } from "../types/weather";
  import { getUserLocation, fetchCurrentWeather } from "../api/weatherService";
  import { getWeatherIconUrl } from "../utils/weatherIcons";

  // Props
  const props = defineProps<{
    selectedLocation?: Location | null;
  }>();

  // Emits
  const emit = defineEmits<{
    (e: "back"): void;
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

  // Go back to home page
  const goBack = () => {
    emit("back");
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
  .weather-details-container {
    max-width: 600px;
  }

  .location-header {
    padding: 1.5rem;
  }

  .location-name {
    font-size: 2rem;
    font-weight: 700;
  }

  .weather-content {
    padding: 2rem;
    text-align: center;
  }

  .weather-icon-large {
    width: 150px;
    height: 150px;
    margin: 0 auto 1.5rem;
  }

  .weather-icon-large img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .temperature-large {
    font-size: 4rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .weather-condition {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .additional-details {
    display: flex;
    justify-content: space-around;
    margin-top: 2rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .detail-label {
    font-size: 1rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .detail-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }

  .back-button-container {
    padding: 1.5rem;
    text-align: center;
  }

  .back-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
  }
</style>
