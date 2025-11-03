/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5faff",
          100: "#e6f0ff",
          200: "#cddfff",
          300: "#a7c4ff",
          400: "#7aa2ff",
          500: "#4d7cff",   // primary
          600: "#345fe6",
          700: "#284ab4",
          800: "#213c90",
          900: "#1d336f"
        }
      }
    }
  },
  plugins: []
};
