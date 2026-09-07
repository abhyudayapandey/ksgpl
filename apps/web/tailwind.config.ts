import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#c9962c",
          dark: "#8a6416",
        },
      },
    },
  },
  plugins: [],
};

export default config;
