/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#147D46",
          dark: "#0F5C34",
          light: "#E7F4EC",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans KR'", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(28, 25, 23, 0.05)",
      },
    },
  },
  plugins: [],
};
