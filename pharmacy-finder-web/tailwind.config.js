/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4BA3C3',
        primaryDark: '#357A96',
        primaryLight: '#C7E7EC',
        secondary: '#B3DDD4',
        secondaryLight: '#D9EEEA',
        accent: '#E7E9E3',
        background: '#FBF9F1',
        light: '#E8F0F1',
        white: '#FFFFFF',
        black: '#000000',
        success: '#388E3C',
        danger: '#D32F2F',
        warning: '#F57C00',
        text: '#2F3E3C',
        textSecondary: '#666666',
        textLight: '#999999',
        border: '#BDDBD1',
        borderLight: '#E8F0F1',
        disabled: '#CCCCCC',
      },
    },
  },
  plugins: [],
}
