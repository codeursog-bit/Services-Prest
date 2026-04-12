// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     './app/**/*.{js,ts,jsx,tsx,mdx}',
//     './components/**/*.{js,ts,jsx,tsx,mdx}',
//     './lib/**/*.{js,ts,jsx,tsx,mdx}',
//   ],
//   theme: {
//     extend: {
//       colors: {
//         brand: {
//           navy: '#1A3A5C',
//           black: '#1A1A19',
//           gray: '#6B6A67',
//           border: '#E8E7E4',
//           surface: '#F7F7F6',
//           green: '#2D6A4F',
//           'green-bg': '#EAF3DE',
//           red: '#9B2335',
//           'red-bg': '#FCEBEB',
//           orange: '#8B4513',
//           'orange-bg': '#FEF3E2',
//         },
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif'],
//       },
//     },
//   },
//   plugins: [],
// }



/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        navy:  { DEFAULT: '#0F2744', dark: '#0A1E35', mid: '#1A3A5C' },
        gold:  { DEFAULT: '#C8A96E', dark: '#B8995E' },
        cream: { DEFAULT: '#FAFAF8', warm: '#F5F0E8', border: '#DDD9D0', dash: '#F0EDE6' },
        muted: '#7A7870',
      },
    },
  },
  plugins: [],
}