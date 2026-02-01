/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector', // Only use .dark class, not prefers-color-scheme
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}
