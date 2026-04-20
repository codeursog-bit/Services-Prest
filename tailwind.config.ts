import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs logo MSP
        'msp-orange':       '#E8500A',
        'msp-orange-dark':  '#c44208',
        'msp-orange-light': '#fdf0eb',
        'msp-violet':       '#3D3B8E',
        'msp-violet-dark':  '#2e2c72',
        'msp-violet-light': '#eeedf8',
        // Palette UI
        'msp-black':        '#1A1A19',
        'msp-gray':         '#6B6A67',
        'msp-border':       '#E8E7E4',
        'msp-bg':           '#F7F7F6',
        'msp-green':        '#2D6A4F',
        'msp-red':          '#9B2335',
        'msp-amber':        '#8B4513',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
