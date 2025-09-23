// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(alert|checkbox|dropdown|input|input-otp|popover|radio|scroll-shadow|select|toast|button|ripple|spinner|form|menu|divider|listbox).js"
],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};