/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rooh: {
          50: '#f0f7f7',
          100: '#dbeeee',
          200: '#bcdddd',
          300: '#92c3c4',
          400: '#64a3a5',
          500: '#478689',
          600: '#386c6f',
          700: '#31585b',
          800: '#2b494c',
          900: '#273e41',
          950: '#15272a',
        },
        slate: {
          850: '#141d2b',
          900: '#0f172a',
          950: '#070d18',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(71, 134, 137, 0.3)',
        'glow-lg': '0 0 35px -5px rgba(71, 134, 137, 0.4)',
      }
    },
  },
  plugins: [],
}
