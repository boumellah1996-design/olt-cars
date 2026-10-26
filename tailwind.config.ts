import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD400",
          ink: "#0B0D12",
          muted: "#6B7280",
        },
      },
      boxShadow: {
        card: "0 18px 50px rgba(15, 23, 42, 0.12)",
        soft: "0 8px 24px rgba(15, 23, 42, 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        arabic: ["var(--font-cairo)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
