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
          slate: "#334155",
          blue: "#3B82F6",
          indigo: "#4F46E5",
          green: "#22C55E",
          amber: "#F59E0B",
          rose: "#E11D48",
          purple: "#9333EA",
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
        "3xl": "28px",
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
          "inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.05), 0 4px 20px 0 rgba(0, 0, 0, 0.04)",
        "liquid-glass-dark":
          "inset 0 1px 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3), 0 8px 30px 0 rgba(0, 0, 0, 0.4)",
        "liquid-glass-elevated":
          "inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 1.5px 0 rgba(0, 0, 0, 0.08), 0 12px 36px 0 rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        "ambient-mesh-1": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)", opacity: "0.1" },
          "50%": { transform: "translate(30px, -30px) scale(1.1)", opacity: "0.15" },
        },
        "ambient-mesh-2": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)", opacity: "0.08" },
          "50%": { transform: "translate(-30px, 25px) scale(1.05)", opacity: "0.12" },
        },
        "spring-pop": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "ambient-1": "ambient-mesh-1 18s ease-in-out infinite",
        "ambient-2": "ambient-mesh-2 22s ease-in-out infinite",
        "spring-pop": "spring-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
