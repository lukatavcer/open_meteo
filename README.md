# Weather App - Open Meteo

A Vue.js application that displays weather information using the [Open Meteo API](https://open-meteo.com/en/docs).


## Live Demo
The site is available at: https://lukatavcer.github.io/open_meteo/


## Architecture Overview

The application follows a modular architecture designed for scalability and maintainability:

### Core Components

- **API Layer**: Handles communication with external services
  - `httpClient.ts`: Base HTTP client for making API requests
  - `weatherService.ts`: Weather-related API calls
  - `locationService.ts`: Location-related API calls

- **Configuration**: Centralizes application settings
  - `api.ts`: API endpoints and parameters
- **Constants**: Application-wide constants
- **Types**: TypeScript type definitions
- **Utilities**: Helper functions and services
  - `logger.ts`: Centralized logging utility

## Extending the Application

### Adding New API Endpoints

1. Add the endpoint to `src/config/api.ts`
2. Create a new service function in the appropriate service file
3. Use the `HttpClient` for making API requests


### Configuring Logging

The logging system can be configured in `src/main.ts`:

```typescript
import logger, { LogLevel } from "./utils/logger";

logger.configure({
  level: import.meta.env.PROD ? LogLevel.ERROR : LogLevel.DEBUG,
  prefix: '[Weather App]',
});
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```


### License

Icons used from [weather-icons](https://github.com/basmilius/weather-icons), licensed under the MIT License.
