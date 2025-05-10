<script setup lang="ts">
  import { ref } from "vue";
  import CurrentWeather from "./components/CurrentWeather.vue";
  import FiveDayForecast from "./components/FiveDayForecast.vue";
  import CitySearch from "./components/CitySearch.vue";
  import WeatherDetails from "./components/WeatherDetails.vue";
  import { Location } from "./types/weather";

  // State for selected location and view mode
  const selectedLocation = ref<Location | null>(null);
  const showDetailsPage = ref<boolean>(false);

  // Handle city selection
  const handleCitySelect = (location: Location) => {
    selectedLocation.value = location;
    showDetailsPage.value = true;
    console.log("Selected location:", location);
  };

  // Handle back button click
  const handleBackToHome = () => {
    showDetailsPage.value = false;
  };
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-slate-800 text-white py-4 px-6 shadow-md fixed top-0 w-full z-10">
      <h1 class="text-xl font-bold">Weather App</h1>
    </header>
    <main class="container mx-auto px-4 pt-20 pb-6 flex-grow bg-gray-50">
      <!-- Home Page -->
      <div v-if="!showDetailsPage">
        <div class="mb-6">
          <CitySearch @select="handleCitySelect" />
        </div>
        <CurrentWeather :selected-location="selectedLocation" />
        <FiveDayForecast :selected-location="selectedLocation" />
      </div>

      <!-- Weather Details Page -->
      <div v-else>
        <WeatherDetails
          :selected-location="selectedLocation"
          @back="handleBackToHome"
        />
      </div>
    </main>
  </div>
</template>

<style scoped></style>
