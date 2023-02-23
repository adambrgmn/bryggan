const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      aspectRatio: {
        paper: '233 / 303',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      // @reach/menu-button
      addVariant('selected', '&[data-selected]');
    }),
  ],
};
