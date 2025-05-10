import "./assets/tailwind.css";
import "./assets/global.css";

import { createApp } from "vue";
import App from "./App.vue";
import logger, { LogLevel } from "./utils/logger";

// Configure logger based on environment
logger.configure({
  level: import.meta.env.PROD ? LogLevel.ERROR : LogLevel.DEBUG,
  prefix: '[Weather App]',
});

// Log application startup
logger.info("Application starting...");

createApp(App).mount("#app");
