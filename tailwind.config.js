/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
        modalIn: {
          from: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        modalOut: {
          from: { opacity: 1, transform: "translateY(0) scale(1)" },
          to: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
        },
        tabIn: {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease-out",
        fadeOut: "fadeOut 0.15s ease-in",
        modalIn: "modalIn 0.2s ease-out",
        modalOut: "modalOut 0.18s ease-in",
        tabIn: "tabIn 0.2s ease-out",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
