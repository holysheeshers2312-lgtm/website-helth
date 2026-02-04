/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF4500", // Fiery Orange
        secondary: "#0f172a", // Slate 900
        accent: "#FBBF24", // Amber
        background: "#050505", // Almost Black
        surface: "#121212", // Dark Gray
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slow-spin': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)' },
          '50%': { opacity: '.5', boxShadow: '0 0 10px rgba(255, 69, 0, 0.2)' },
        },
      },
      backgroundImage: {
        'gradient-fire': 'linear-gradient(to right, #FF4500, #FBBF24)',
        'gradient-dark': 'linear-gradient(to bottom, #050505, #121212)',
      }
    },
  },
  plugins: [],
}
