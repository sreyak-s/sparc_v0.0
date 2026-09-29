import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        space: {
          950: "#02040A",
          900: "#040915",
          850: "#070E22",
          800: "#0B1530",
          700: "#111F45",
          600: "#1A2E63",
          500: "#274288",
        },
        sparc: {
          cyan: "#00F0FF",
          "cyan-dim": "#00A8B3",
          blue: "#38BDF8",
          electric: "#0284C7",
          amber: "#F59E0B",
          gold: "#EAB308",
          emerald: "#10B981",
          crimson: "#EF4444",
          violet: "#8B5CF6",
        },
      },
      backgroundImage: {
        "space-radial": "radial-gradient(circle at 50% 20%, rgba(2, 132, 199, 0.15), rgba(2, 4, 10, 0.95) 75%)",
        "cyan-radial": "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15), transparent 70%)",
        "hud-grid": "linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
      },
      boxShadow: {
        "glow-cyan": "0 0 25px -5px rgba(0, 240, 255, 0.4)",
        "glow-cyan-sm": "0 0 12px -2px rgba(0, 240, 255, 0.35)",
        "glow-cyan-lg": "0 0 45px -5px rgba(0, 240, 255, 0.5)",
        "glow-amber": "0 0 25px -5px rgba(245, 158, 11, 0.4)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
        "glow-crimson": "0 0 25px -5px rgba(239, 68, 68, 0.45)",
        "glass-panel": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "orbit-slow": "orbit 28s linear infinite",
        "orbit-reverse": "orbit-reverse 35s linear infinite",
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "radar-sweep": "radar 4s linear infinite",
      },
      keyframes: {
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "orbit-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(0, 240, 255, 0.6))" },
          "50%": { opacity: "0.6", filter: "drop-shadow(0 0 5px rgba(0, 240, 255, 0.2))" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
