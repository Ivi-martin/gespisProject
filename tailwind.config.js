/** @type {import('tailwindcss').Config} */
export default {
    // Le decimos a Tailwind dónde buscar clases para incluirlas en el CSS final.
    // En la estructura unificada, el React está en resources/js/
    // (antes estaba en un frontend/ separado).
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
