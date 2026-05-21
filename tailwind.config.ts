import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: {
          50: "#f7f3ee",
          100: "#ede4d6",
          200: "#d9c9b0",
          300: "#c4a97f",
          400: "#b08a52",
          500: "#8c6a35",
          600: "#6e5028",
          700: "#503a1e",
          800: "#342516",
          900: "#1c140d",
        },
        paper: {
          50: "#fdfaf5",
          100: "#f9f2e3",
          200: "#f3e6ca",
          300: "#ead4a8",
          400: "#dfbe82",
          500: "#d3a75d",
        },
        accent: {
          red: "#c0392b",
          blue: "#1a5276",
          green: "#1e8449",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        scan: "scan 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        scan: { "0%": { top: "0%" }, "50%": { top: "90%" }, "100%": { top: "0%" } },
      },
    },
  },
  plugins: [],
};
export default config;
