/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1A3A5C',
          black: '#1A1A19',
          gray: '#6B6A67',
          border: '#E8E7E4',
          surface: '#F7F7F6',
          green: '#2D6A4F',
          'green-bg': '#EAF3DE',
          red: '#9B2335',
          'red-bg': '#FCEBEB',
          orange: '#8B4513',
          'orange-bg': '#FEF3E2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}