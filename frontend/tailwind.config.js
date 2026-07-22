/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F2',
        'paper-raised': '#FFFFFF',
        ink: '#16211D',
        'ink-soft': '#4B5951',
        'page-ink': '#F5F6F2',
        'page-ink-soft': '#9BA79E',
        teal: {
          DEFAULT: '#12B579',
          dark: '#084F39',
          soft: '#E4F0EA',
        },
        amber: {
          DEFAULT: '#C98A2C',
          soft: '#FBF0DE',
        },
        line: '#E1E4DE',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};