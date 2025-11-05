import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    publicDir: "",
    base: "/systems/fading-suns-4/",
    server: {
        port: 30001,
        open: "/",
        proxy: {
            "^(?!/systems/fading-suns-4)": "http://localhost:30000/",
            "/socket.io": {
                target: "ws://localhost:30000",
                ws: true,
            },
        },
        watch: {
            usePolling: true,
            interval: 500,
        },
    },
    esbuild: { keepNames: true },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: "system.json",
                    dest: "",
                },
                {
                    src: "templates",
                    dest: "",
                },
                {
                    src: "lang",
                    dest: "",
                },
            ],
        }),
    ],
    build: {
        outDir: "dist",
        emptyOutDir: false,
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: "[name].mjs",
                chunkFileNames: "[name].mjs",
                assetFileNames: "[name].[ext]",
            },
        },
        lib: {
            name: "fading-suns-4",
            entry: "fading-suns-4.mjs",
            formats: ["es"],
            fileName: "fading-suns-4"
        }
    },
});
