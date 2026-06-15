/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bank: {
          950: "#061225",
          900: "#071a33",
          800: "#0b274a",
          700: "#123a68",
          500: "#1f6feb",
          300: "#82b7ff"
        }
      },
      boxShadow: {
        glass: "0 18px 60px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};

