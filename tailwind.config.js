/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e6e9f0',
          100: '#ccd3e1',
          200: '#99a7c3',
          300: '#667ba5',
          400: '#334f87',
          500: '#0a1628',
          600: '#132040',
          700: '#0f1d35',
          800: '#0c182a',
          900: '#08121f',
          950: '#050b14',
        },
        gold: {
          50: '#fdf8e8',
          100: '#faf1d1',
          200: '#f5e3a3',
          300: '#f0d575',
          400: '#ebc747',
          500: '#b8860b',
          600: '#936b09',
          700: '#6e5007',
          800: '#4a3505',
          900: '#251b02',
        },
        cream: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
        },
        anthracite: {
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#bababa',
          400: '#a3a3a3',
          500: '#2d2d2d',
          600: '#242424',
          700: '#1b1b1b',
          800: '#121212',
          900: '#090909',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a1628 0%, #132040 50%, #0f1d35 100%)',
        'gold-gradient': 'linear-gradient(90deg, #b8860b 0%, #ebc747 50%, #b8860b 100%)',
      },
    },
  },
  plugins: [],
};
