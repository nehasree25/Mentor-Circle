/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
