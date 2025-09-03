import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", "sans-serif"],
        alegreya: ["var(--font-alegreya-sans)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customBlue: "#122640",
        customPink: "#E02988",
        customLight: "#F2EEEB",
        customBackground: "#F5F9FB"
      },
    },
  },
  plugins: [],
};
export default config;
