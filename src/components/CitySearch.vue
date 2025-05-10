<template>
  <div class="city-search-container">
    <div class="search-input-container">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleInput"
        @focus="showDropdown = true"
        placeholder="Search for a city..."
        class="search-input"
      />
      <button v-if="searchQuery" @click="clearSearch" class="clear-button">×</button>
    </div>

    <div
      v-if="showDropdown && (loading || results.length > 0 || error)"
      class="search-results-dropdown"
    >
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Searching...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
      </div>

      <div v-else class="results-list">
        <div
          v-for="(result, index) in results"
          :key="index"
          @click="selectCity(result)"
          class="result-item"
        >
          <div class="result-name">{{ result.city }}, {{ result.country }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";
  import { Location } from "../types/weather";
  import { searchCities } from "../api/weatherService";

  // Props and emits
  const emit = defineEmits<{
    (e: "select", location: Location): void;
  }>();

  // State
  const searchQuery = ref<string>("");
  const results = ref<Location[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const showDropdown = ref<boolean>(false);
  const debounceTimeout = ref<number | null>(null);

  // Handle input with debounce
  const handleInput = () => {
    // Clear any existing timeout
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value);
    }

    // Set a new timeout
    debounceTimeout.value = setTimeout(() => {
      if (searchQuery.value.trim()) {
        performSearch();
      } else {
        results.value = [];
        error.value = null;
      }
    }, 300) as unknown as number;
  };

  // Perform the search
  const performSearch = async () => {
    loading.value = true;
    error.value = null;

    try {
      results.value = await searchCities(searchQuery.value);
    } catch (err: any) {
      console.error("Error searching for cities:", err);
      error.value = err.message || "Failed to search for cities";
      results.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Clear search
  const clearSearch = () => {
    searchQuery.value = "";
    results.value = [];
    error.value = null;
  };

  // Select a city
  const selectCity = (location: Location) => {
    emit("select", location);
    searchQuery.value = `${location.city}, ${location.country}`;
    showDropdown.value = false;
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".city-search-container")) {
      showDropdown.value = false;
    }
  };

  // Add and remove event listener
  watch(
    () => showDropdown.value,
    newValue => {
      if (newValue) {
        document.addEventListener("click", handleClickOutside);
      } else {
        document.removeEventListener("click", handleClickOutside);
      }
    }
  );
</script>

<style scoped>
  .city-search-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    position: relative;
  }

  .search-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .search-input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  .clear-button {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #999;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  .clear-button:hover {
    color: #666;
  }

  .search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-top: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
  }

  /* Override global loading container for search */
  .loading-container {
    padding: 1.5rem;
  }

  .loading-spinner {
    border-width: 3px;
    width: 24px;
    height: 24px;
    margin-bottom: 0.5rem;
  }

  .loading-text {
    font-size: 0.9rem;
  }

  .error-container {
    padding: 1rem;
  }

  .error-message {
    font-size: 0.9rem;
  }

  .results-list {
    padding: 0.5rem 0;
  }

  .result-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .result-item:hover {
    background-color: #f5f5f5;
  }

  .result-name {
    font-size: 1rem;
    color: #333;
  }
</style>
