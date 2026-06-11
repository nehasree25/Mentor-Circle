/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['OpenAI Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        navy: "#0F172A",
        royal: "#2563EB",
        darkblue: "#1D4ED8",
        softblue: "#DBEAFE",
        appbg: "#F8FAFC",
        borderline: "#E2E8F0",
        textsecondary: "#475569",
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