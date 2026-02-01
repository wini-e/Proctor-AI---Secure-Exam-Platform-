export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF', // A deep blue
        'primary-hover': '#1D4ED8',
        secondary: '#F97316', // A vibrant orange
        background: '#F1F5F9', // A light gray
        surface: '#FFFFFF', // White
        text: '#0F172A', // A dark slate
        'text-secondary': '#64748B',
      }
    },
  },
  plugins: [],
}