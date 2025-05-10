import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { mergeConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig as defineTestConfig } from "vitest/config";

// https://vite.dev/config/
export default mergeConfig(
  defineConfig({
    base: "/open_meteo/", // Must match the repo name
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  }),
  defineTestConfig({
    test: {
      globals: true,
      environment: "happy-dom",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      },
    },
  })
);
