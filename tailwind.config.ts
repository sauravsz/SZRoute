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
        apple: {
          blue: "#007AFF",
          "blue-dark": "#0A84FF",
          green: "#34C759",
          "green-dark": "#30D158",
          indigo: "#5856D6",
          orange: "#FF9500",
          pink: "#FF2D55",
          purple: "#AF52DE",
          red: "#FF3B30",
          teal: "#5AC8FA",
          yellow: "#FFCC00",
          gray: "#8E8E93",
          gray2: "#AEAEB2",
          gray3: "#C7C7CC",
          gray4: "#D1D1D6",
          gray5: "#E5E5EA",
          gray6: "#F2F2F7",
          "card-light": "#FFFFFF",
          "card-dark": "#1C1C1E",
          "card-dark-elevated": "#2C2C2E",
          "bg-light": "#F2F2F7",
          "bg-dark": "#000000",
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
        "apple-card": "0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04)",
        "apple-card-hover": "0 4px 16px rgba(0, 0, 0, 0.08), 0 16px 40px rgba(0, 0, 0, 0.06)",
        "apple-elevated": "0 8px 32px rgba(0, 0, 0, 0.12), 0 24px 64px rgba(0, 0, 0, 0.08)",
        "apple-glow-blue": "0 0 0 4px rgba(0, 122, 255, 0.18)",
      },
      keyframes: {
        "spring-pop": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "70%": { transform: "scale(1.02)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "spring-slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "70%": { transform: "translateY(-2px)", opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "spring-pop": "spring-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "spring-slide-up": "spring-slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
