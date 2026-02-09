/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "rgba(var(--color-primary), 1)",
        secondary: "rgba(var(--color-secondary), 1)",
        accent: "rgba(var(--color-accent), 1)",
        background: "rgba(var(--color-background), 1)",
        surface: "rgba(var(--color-surface), 1)",
        foreground: "rgba(var(--color-text), 1)",
        'glass': 'rgba(var(--color-glass), 0.05)',
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
        'gradient-fire': 'linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-accent)))',
        'gradient-dark': 'linear-gradient(to bottom, rgb(var(--color-background)), rgb(var(--color-surface)))',
      }
    },
  },
  plugins: [],
}
