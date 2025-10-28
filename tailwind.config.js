module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // updated professional palette: deep-teal primary, warm-accent
        primary: '#0b5563',
        accent: '#f59e0b',
        neutralDark: '#0f1724'
      }
    },
    fontFamily: {
      sans: ['"IBM Plex Sans Arabic"', 'Inter', 'ui-sans-serif', 'system-ui']
    }
  },
  plugins: []
}
