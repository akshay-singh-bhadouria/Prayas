import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f7f7f6',
          100: '#e8e6e1',
          200: '#cfc9bd',
          300: '#b3a792',
          400: '#8f8063',
          500: '#745f47',
          600: '#5c4a38',
          700: '#483a2c',
          800: '#2e241d',
          900: '#191411'
        },
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        },
        calm: {
          50: '#eef7f5',
          100: '#d6ebe6',
          200: '#b3d7cf',
          300: '#88beb1',
          400: '#5aa292',
          500: '#3d8676',
          600: '#2f6a5e',
          700: '#25524a',
          800: '#1b3a34',
          900: '#122521'
        }
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'serif'],
        body: ['var(--font-body)', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 30px -20px rgba(0,0,0,0.45)'
      }
    }
  },
  plugins: []
};

export default config;
