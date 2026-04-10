/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2',
        dark: '#1A1210',
        'dark-secondary': '#2D2016',
        accent: '#C4956A',
        'accent-hover': '#B8845A',
        'accent-light': '#D4A87A',
        'text-primary': '#2D2016',
        'text-muted': '#8B7355',
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB',
        card: '#FFFFFF',
        'card-border': '#E8E0D4',
        'card-assistant': '#FFFDF9',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'typing-dot': 'typing-dot 1.4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { opacity: '0.3', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
