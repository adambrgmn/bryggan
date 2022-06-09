const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
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
