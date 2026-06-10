/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F172A",
        royal: "#7C3AED",
        darkpurple: "#6D28D9",
        softlavender: "#F5F3FF",
        lavender50: "#FAF5FF",
        lavender100: "#F3E8FF",
        lavender200: "#E9D5FF",
        appbg: "#F5F3FF",
        borderline: "#E9D5FF",
        textsecondary: "#6B7280",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(124, 58, 237, 0.08)",
        glow: "0 0 40px rgba(124, 58, 237, 0.15)",
        inner: "inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      borderRadius: {
        glass: "32px",
      },
    },
  },
  plugins: [],
};