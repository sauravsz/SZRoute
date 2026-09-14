import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9fe870",
          active: "#cdffad",
          neutral: "#c5edab",
          pale: "#e2f6d5",
          on: "#0e0f0c",
        },
        ink: {
          DEFAULT: "#0e0f0c",
          deep: "#163300",
        },
        body: "#454745",
        mute: "#868685",
        canvas: {
          DEFAULT: "#ffffff",
          soft: "#e8ebe6",
        },
        positive: {
          DEFAULT: "#2ead4b",
          deep: "#054d28",
        },
        warning: {
          DEFAULT: "#ffd11a",
          deep: "#b86700",
          content: "#4a3b1c",
        },
        negative: {
          DEFAULT: "#d03238",
          deep: "#a72027",
          darkest: "#a7000d",
          bg: "#320707",
        },
        accent: {
          orange: "#ffc091",
          cyan: "#38c8ff",
        },
      },
      borderRadius: {
        none: "0px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "9999px",
        full: "9999px",
      },
      fontFamily: {
        display: [
          '"Inter"',
          '"Wise Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        sans: [
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Geist Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      boxShadow: {
        "wise-card": "0 1px 3px rgba(14, 15, 12, 0.04), 0 6px 16px rgba(14, 15, 12, 0.04)",
        "wise-elevated": "0 2px 6px rgba(14, 15, 12, 0.06), 0 12px 32px rgba(14, 15, 12, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
