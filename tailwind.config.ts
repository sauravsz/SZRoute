import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        liquid: {
          blue: "#007AFF",
          cyan: "#32ADE6",
          purple: "#AF52DE",
          indigo: "#5856D6",
          green: "#34C759",
          orange: "#FF9500",
          pink: "#FF2D55",
          red: "#FF3B30",
        },
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
        "4xl": "36px",
        pill: "9999px",
        full: "9999px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "SFMono-Regular",
          "ui-monospace",
          "Menlo",
          "Monaco",
          "monospace",
        ],
      },
      boxShadow: {
        "liquid-glass":
          "inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.08), 0 8px 32px 0 rgba(0, 0, 0, 0.06), 0 2px 8px 0 rgba(0, 0, 0, 0.04)",
        "liquid-glass-dark":
          "inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.4), 0 12px 40px 0 rgba(0, 0, 0, 0.45), 0 2px 10px 0 rgba(0, 0, 0, 0.3)",
        "liquid-glass-elevated":
          "inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.12), 0 16px 48px 0 rgba(0, 0, 0, 0.1), 0 4px 16px 0 rgba(0, 0, 0, 0.06)",
        "liquid-glow-blue":
          "0 0 24px rgba(0, 122, 255, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
        "liquid-glow-green":
          "0 0 24px rgba(52, 199, 89, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
      },
      keyframes: {
        "liquid-jelly": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.05, 0.95)" },
          "50%": { transform: "scale(0.97, 1.03)" },
          "70%": { transform: "scale(1.01, 0.99)" },
          "100%": { transform: "scale(1)" },
        },
        "ambient-mesh-1": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)", opacity: "0.6" },
          "33%": { transform: "translate(40px, -50px) scale(1.15)", opacity: "0.8" },
          "66%": { transform: "translate(-30px, 30px) scale(0.9)", opacity: "0.5" },
        },
        "ambient-mesh-2": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)", opacity: "0.5" },
          "33%": { transform: "translate(-50px, 40px) scale(1.1)", opacity: "0.75" },
          "66%": { transform: "translate(40px, -40px) scale(0.95)", opacity: "0.6" },
        },
        "ambient-mesh-3": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)", opacity: "0.5" },
          "50%": { transform: "translate(30px, 30px) scale(1.2)", opacity: "0.7" },
        },
        "specular-sweep": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "liquid-jelly": "liquid-jelly 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ambient-1": "ambient-mesh-1 16s ease-in-out infinite",
        "ambient-2": "ambient-mesh-2 20s ease-in-out infinite",
        "ambient-3": "ambient-mesh-3 24s ease-in-out infinite",
        "specular": "specular-sweep 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
