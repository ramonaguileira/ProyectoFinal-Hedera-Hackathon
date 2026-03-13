const path = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        'eggo-green': '#22c55e',
        'eggo-green-dark': '#16a34a',
        'eggo-earth': '#92400e',
        'eggo-earth-light': '#b45309',
        'eggo-cream': '#fefce8',
        'eggo-bg': '#f0fdf4',
      },
    },
  },
  plugins: [],
}
