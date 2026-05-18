/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFBF5',
          100: '#FDF6EB',
          200: '#F9EBD6',
          300: '#F2DDBE',
        },
        peach: {
          50: '#FFF4EC',
          100: '#FFE6D4',
          200: '#FFD1B0',
          300: '#FFB785',
          400: '#FF9655',
          500: '#FF7A2E',
          600: '#E96416',
          700: '#C04E0E',
        },
        coral: {
          100: '#FFE2D8',
          300: '#FFA48B',
          500: '#F26A4B',
          600: '#D2533A',
        },
        sage: {
          100: '#E2F1DA',
          300: '#B2D6A4',
          500: '#7AB169',
          600: '#5E8E51',
        },
        ink: {
          900: '#2A2520',
          700: '#4A413A',
          500: '#6B6056',
          400: '#8C8278',
          300: '#B7AEA2',
        },
        warm: {
          line: '#EBDFCB',
          surface: '#FFFCF7',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 16px -4px rgba(201, 138, 80, 0.18), 0 2px 4px -2px rgba(201, 138, 80, 0.08)',
        glow: '0 8px 30px -8px rgba(255, 122, 46, 0.45)',
        ring: '0 0 0 4px rgba(255, 122, 46, 0.18)',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FFB785 0%, #FF7A2E 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FFF4EC 0%, #FFE6D4 100%)',
        'gradient-cream': 'linear-gradient(135deg, #FFFBF5 0%, #FDF6EB 60%, #F9EBD6 100%)',
        'gradient-sage': 'linear-gradient(135deg, #E2F1DA 0%, #B2D6A4 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
