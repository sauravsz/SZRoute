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
        canvas: "#07080a",
        surface: {
          DEFAULT: "#0d0d0d",
          elevated: "#101111",
          card: "#121212",
          button: "#18191a",
        },
        hairline: {
          DEFAULT: "#242728",
          soft: "rgba(255, 255, 255, 0.08)",
          strong: "rgba(255, 255, 255, 0.16)",
        },
        ink: "#f4f4f6",
        body: "#cdcdcd",
        charcoal: "#d3d3d4",
        mute: "#9c9c9d",
        ash: "#6a6b6c",
        stone: "#434345",
        accent: {
          blue: "#57c1ff",
          "blue-soft": "rgba(87, 193, 255, 0.15)",
          red: "#ff6161",
          "red-soft": "rgba(255, 97, 97, 0.15)",
          green: "#59d499",
          "green-soft": "rgba(89, 212, 153, 0.15)",
          yellow: "#ffc533",
          "yellow-soft": "rgba(255, 197, 51, 0.15)",
        },
        hero: {
          start: "#ff5757",
          end: "#a1131a",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "16px",
      },
      fontFamily: {
        sans: [
          "Inter",
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
          "Menlo",
          "Monaco",
          "monospace",
        ],
      },
      backgroundImage: {
        "key-gradient": "linear-gradient(180deg, #121212 0%, #0d0d0d 100%)",
        "hero-stripe": "linear-gradient(135deg, #ff5757 0%, #a1131a 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
