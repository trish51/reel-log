/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        modalIn: {
          from: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease-out",
        modalIn: "modalIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
