import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf4ec",
          100: "#f9e4cc",
          400: "#e2a35c",
          500: "#c9822f", // primary brand accent
          600: "#a8661f",
          700: "#7d4c17",
          900: "#2b1a0d",
        },
        ink: "#151312",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
