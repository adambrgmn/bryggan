const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      aspectRatio: {
        paper: '960 / 1235',
      },
      colors: {
        dropbox: '#0061fe',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      // @radix-ui/react-dropdown-menu
      addVariant('selected', '&[data-selected]');
    }),
  ],
};
