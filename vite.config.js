import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react   from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/App.jsx',   // mayúscula — único archivo de entrada en Windows
            ],
            refresh: true,
        }),
        react(),
    ],
});
