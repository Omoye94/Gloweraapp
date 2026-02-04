/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E8B4CB',
          light: '#F5D6E5',
          dark: '#D699B3',
        },
        secondary: {
          DEFAULT: '#B4D4E8',
          light: '#D6E8F5',
          dark: '#8ABFDB',
        },
        accent: {
          DEFAULT: '#D4E8B4',
          light: '#E8F5D6',
          dark: '#BFDB8A',
        },
        background: '#FFF9F5',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#4A4A4A',
          light: '#8A8A8A',
        },
        success: '#B4E8C7',
        warning: '#E8D4B4',
        // Category colors
        nutrition: '#FFD6E0',
        movement: '#C7E9FF',
        supplements: '#D4FFE0',
        hobbies: '#FFE4C7',
        selfCare: '#E4D4FF',
        reflection: '#FFF4C7',
      },
      borderRadius: {
        'soft': '16px',
        'softer': '24px',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
