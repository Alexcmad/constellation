/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#3a86ff',
            dark: '#0043ce'
          },
          secondary: {
            DEFAULT: '#ff006e'
          },
          warning: {
            DEFAULT: '#ffbe0b'
          },
          danger: {
            DEFAULT: '#fb5607'
          },
          alert: {
            DEFAULT: '#ff0000'
          },
          success: {
            DEFAULT: '#06d6a0'
          }
        }
      },
    },
    plugins: [],
  }