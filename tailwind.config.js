/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        day: {
          bg: '#f7f7f7',
          text: '#535353',
          ground: '#535353',
        },
        night: {
          bg: '#222',
          text: '#fff',
          ground: '#fff',
        },
      },
    },
  },
  plugins: [],
}
