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

    <div v-else-if="weather" class="weather-card" @click="showDetails" role="button" tabindex="0">
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
    (e: "show-details"): void;
  }>();

  // Show weather details
  const showDetails = () => {
    emit("show-details");
  };

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
    max-width: 400px;
  }

  .weather-card {
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .weather-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .location-title {
    font-size: 1.2rem;
    font-weight: 400;
  }

  .weather-info {
    display: flex;
    align-items: center;
    padding: 1.5rem;
  }

  .weather-icon {
    flex: 0 0 100px;
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
