import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";
import vuePlugin from "eslint-plugin-vue";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        fetch: "readonly",
      },
      parserOptions: {
        ecmaVersion: 2021,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2021,
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      vue: vuePlugin,
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/html-self-closing": [
        "error",
        {
          html: { void: "always", normal: "always", component: "always" },
        },
      ],
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.vue"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": ["error", {}, { usePrettierrc: true }],
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
  },

  {
    ignores: ["node_modules/**", "dist/**", "**/*.log", ".DS_Store", ".vite-cache/**"],
  },
];
