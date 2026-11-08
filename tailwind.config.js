/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070611',
          card: '#0f0c22',
          cardHover: '#171333',
          border: 'rgba(0, 240, 255, 0.2)',
          borderPink: 'rgba(255, 0, 127, 0.3)',
          cyan: '#00f0ff',
          cyanGlow: 'rgba(0, 240, 255, 0.5)',
          pink: '#ff007f',
          pinkGlow: 'rgba(255, 0, 127, 0.5)',
          purple: '#9d4edd',
          darkPurple: '#150f2f',
          textMuted: '#94a3b8',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4), inset 0 0 15px rgba(0, 240, 255, 0.1)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.4), inset 0 0 15px rgba(255, 0, 127, 0.1)',
        'neon-dual': '0 0 20px rgba(0, 240, 255, 0.4), 0 0 35px rgba(255, 0, 127, 0.3)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(0, 240, 255, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
