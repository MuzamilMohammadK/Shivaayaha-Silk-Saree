/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        silk: {
          maroon: {
            50: '#FDF2F4',
            100: '#FCE7EB',
            200: '#F7C6CF',
            300: '#EE96A7',
            400: '#DE5F7B',
            500: '#C73456',
            600: '#A92042',
            700: '#8A1534',
            800: '#6B1724',
            900: '#540E1B',
            950: '#32060E',
          },
          gold: {
            50: '#FDFCF6',
            100: '#FAF6E5',
            200: '#F4E9C1',
            300: '#EBD893',
            400: '#DFC265',
            500: '#D4AF37', // Traditional Zari Gold
            600: '#B89225',
            700: '#94721C',
            800: '#755819',
            900: '#5C4417',
          },
          cream: {
            50: '#FDFBF9',
            100: '#FAF6F0',
            200: '#F4EDE1',
            300: '#EBE0CE',
            400: '#DFCDB5',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
