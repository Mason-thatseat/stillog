import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#A78B71",
          light: "#D4C4B5",
        },
        background: {
          DEFAULT: "#FFFFFF",
          subtle: "#F9FAFB",
        },
        foreground: {
          DEFAULT: "#1F2937",
          muted: "#6B7280",
        },
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
