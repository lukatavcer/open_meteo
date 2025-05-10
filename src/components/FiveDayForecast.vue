<template>
  <div class="forecast-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading forecast data...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="loadForecastData()" class="retry-button">Try Again</button>
    </div>

    <div v-else-if="forecast" class="forecast-card">
      <div class="location-info">
        <h2 class="location-name">5-Day Forecast: {{ forecast.location.city }}</h2>
      </div>

      <div class="forecast-days">
        <div v-for="(day, index) in forecast.days" :key="index" class="forecast-day">
          <div class="date">{{ formatDate(day.date) }}</div>
          <div class="weather-icon">
            <img :src="getWeatherIconUrl(day.weatherCode)" :alt="day.weatherCondition" />
          </div>
          <div class="temperatures">
            <span class="max-temp">{{ Math.round(day.maxTemperature) }}°</span>
            <span class="temp-separator">/</span>
            <span class="min-temp">{{ Math.round(day.minTemperature) }}°</span>
          </div>
          <div class="condition">{{ day.weatherCondition }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, defineProps } from "vue";
  import { ForecastData, Location } from "../types/weather";
  import { getUserLocation, fetchForecast } from "../api/weatherService";
  import { getWeatherIconUrl } from "../utils/weatherIcons";

  // Props
  const props = defineProps<{
    selectedLocation?: Location | null;
  }>();

  // State
  const forecast = ref<ForecastData | null>(null);
  const loading = ref<boolean>(true);
  const error = ref<string | null>(null);

  // Format date to display day of week and month/day
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Load forecast data
  const loadForecastData = async (location?: Location) => {
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

      // Fetch forecast data
      forecast.value = await fetchForecast(latitude, longitude);
    } catch (err: any) {
      console.error("Error loading forecast data:", err);
      error.value = err.message || "Failed to load forecast data";
    } finally {
      loading.value = false;
    }
  };

  // Watch for changes in selected location
  watch(
    () => props.selectedLocation,
    newLocation => {
      if (newLocation) {
        loadForecastData(newLocation);
      }
    },
    { immediate: true }
  );

  // Load forecast data when the component is mounted (if no location is selected)
  onMounted(() => {
    if (!props.selectedLocation) {
      loadForecastData();
    }
  });
</script>

<style scoped>
  .forecast-container {
    max-width: 800px;
    margin: 2rem auto 0;
  }

  .forecast-days {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
  }

  .forecast-day {
    flex: 1;
    padding: 0.5rem;
    text-align: center;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Mobile responsive styles for horizontal scrolling */
  @media (max-width: 768px) {
    .forecast-days {
      justify-content: flex-start;
      overflow-x: auto;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 1rem; /* Add padding for scrollbar */
      /* Hide scrollbar for IE, Edge, and Firefox */
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
    }

    /* Hide scrollbar for Chrome, Safari, and Opera */
    .forecast-days::-webkit-scrollbar {
      display: none;
    }

    .forecast-day {
      flex: 0 0 auto;
      width: 120px; /* Fixed width for each day on mobile */
    }
  }

  .forecast-day:last-child {
    border-right: none;
  }

  .date {
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .weather-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 0.5rem;
    filter: invert(10%) contrast(110%);
  }

  .temperatures {
    margin-bottom: 0.5rem;
  }

  .max-temp {
    font-weight: 700;
    color: #e74c3c;
  }

  .temp-separator {
    margin: 0 0.25rem;
    color: #999;
  }

  .min-temp {
    font-weight: 700;
    color: #3498db;
  }

  .condition {
    font-size: 0.8rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
