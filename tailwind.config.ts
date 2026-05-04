import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7C3AED",
          purpledeep: "#2E0854",
          purplesoft: "#A855F7",
          lavender: "#C084FC",
          teal: "#06B6D4",
          cyan: "#22D3EE",
          mint: "#4FD1C5",
          navy: "#0F172A",
          ink: "#111827",
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
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #3B0B6F 0%, #1E1B4B 35%, #0F172A 55%, #0B4F5C 85%, #042F2E 100%)",
        "cta-gradient": "linear-gradient(90deg, #2E0854 0%, #0A0A0A 55%, #0A0A0A 100%)",
        "word-real": "linear-gradient(90deg, #A855F7 0%, #3B82F6 100%)",
        "icon-tile": "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
        "rep-bar": "linear-gradient(90deg, #22D3EE 0%, #06B6D4 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
