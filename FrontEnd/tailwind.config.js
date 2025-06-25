/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        raleway: ["Raleway", "sans-serif"],
      },
    },
    screens: {
      ms: "321px",
      mm: "376px",
      ml: "426px",
      t: "769px",
      l: "1025px",
      ll: "1441px",
    },
  },
  plugins: [],
};
