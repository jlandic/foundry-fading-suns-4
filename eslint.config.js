import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: {
            globals: {
                CONST: false,
                process: false,
                foundry: false,
                game: false,
                CONFIG: true,
                Actor: false,
                Folder: false,
                Handlebars: false,
                Macro: false,
                Item: false,
                Hooks: false,
                ui: false,
                ChatMessage: false,
                Roll: false,
                fromUuid: false,
                fromUuidSync: false,
                renderTemplate: false,
                Babele: false,
                ...globals.browser
            }
        }
    },
    { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
    { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
]);
