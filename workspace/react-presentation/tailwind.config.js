/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a567d',
        secondary: '#2d7d9a',
        accent: '#e8f4f8',
        dark: '#1a1a2e',
      },
    },
  },
  plugins: [],
}
