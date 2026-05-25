import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#E91E8C",
          sky: "#00B4D8",
          purple: "#6B21A8",
          purpledeep: "#4C1D95",
          white: "#FFFFFF",
          ink: "#111827",
          navy: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        "card-lg": "0 10px 40px -10px rgb(0 0 0 / 0.25)",
        float: "0 25px 50px -12px rgb(0 0 0 / 0.35)",
        "gallery-frame": "0 20px 50px -12px rgb(233 30 140 / 0.25), 0 12px 24px -8px rgb(0 180 216 / 0.2)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #4C1D95 0%, #6B21A8 28%, #1a0a2e 48%, #0f172a 72%, #004e6b 100%)",
        "cta-gradient": "linear-gradient(90deg, #4C1D95 0%, #6B21A8 35%, #0a0a0a 70%, #0a0a0a 100%)",
        "word-real": "linear-gradient(90deg, #E91E8C 0%, #00B4D8 100%)",
        "icon-tile": "linear-gradient(135deg, #E91E8C 0%, #00B4D8 100%)",
        "rep-bar": "linear-gradient(90deg, #00B4D8 0%, #E91E8C 100%)",
        "brand-sash": "linear-gradient(180deg, #00B4D8 0%, #E91E8C 100%)",
        "brand-sash-diag": "linear-gradient(135deg, #00B4D8 0%, #E91E8C 55%, #6B21A8 100%)",
        "gallery-placeholder":
          "linear-gradient(135deg, rgba(233,30,140,0.35) 0%, rgba(0,180,216,0.35) 50%, rgba(107,33,168,0.45) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
