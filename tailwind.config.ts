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
        page: "var(--bg-page)",
        card: "var(--bg-card)",
        subtle: {
          DEFAULT: "var(--bg-subtle)",
          hover: "var(--bg-subtle-hover)",
        },
        ink: {
          DEFAULT: "var(--text-ink)",
          body: "var(--text-body)",
          mute: "var(--text-mute)",
        },
        primary: {
          DEFAULT: "#9fe870",
          active: "#cdffad",
          neutral: "#c5edab",
          pale: "var(--bg-pale-green)",
          on: "#0e0f0c",
        },
        border: {
          card: "var(--border-card)",
          input: "var(--border-input)",
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
        "wise-card": "var(--shadow-card)",
        "wise-elevated": "0 4px 12px rgba(14, 15, 12, 0.08), 0 16px 40px rgba(14, 15, 12, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
