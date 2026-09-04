/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#050510",
        "bg-panel": "#0d0d1f",
        "purple-neon": "#7b2fff",
        "magenta-neon": "#ff3cf7",
        "cyan-neon": "#00d4ff",
      },
      boxShadow: {
        glow: "0 0 20px rgba(123,47,255,0.45)",
        "glow-magenta": "0 0 20px rgba(255,60,247,0.45)",
        "glow-cyan": "0 0 20px rgba(0,212,255,0.4)",
      },
      backgroundImage: {
        "gradient-neon":
          "linear-gradient(135deg, #7b2fff 0%, #ff3cf7 60%, #00d4ff 100%)",
        "gradient-panel":
          "linear-gradient(160deg, rgba(123,47,255,0.12) 0%, rgba(13,13,31,0.6) 60%)",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
