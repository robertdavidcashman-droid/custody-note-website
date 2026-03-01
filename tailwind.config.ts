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
        // Legal/professional palette with authority and trust
        custody: {
          navy: "#0f172a",
          slate: "#1e293b",
          blue: "#1e40af",
          accent: "#3b82f6",
          accentDark: "#2563eb",
          accentLight: "#60a5fa",
          light: "#f1f5f9",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
