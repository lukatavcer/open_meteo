<script setup lang="ts">
  import CurrentWeather from "./components/CurrentWeather.vue";
  import FiveDayForecast from "./components/FiveDayForecast.vue";
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-slate-800 text-white py-4 px-6 shadow-md fixed top-0 w-full z-10">
      <h1 class="text-xl font-bold">Weather App</h1>
    </header>
    <main class="container mx-auto px-4 pt-20 pb-6 flex-grow">
      <CurrentWeather />
      <FiveDayForecast />
    </main>
  </div>
</template>

<style scoped></style>
