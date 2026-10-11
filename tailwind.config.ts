import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1360px",
      },
    },
    extend: {
      colors: {
        border: "#e2e8f0",
        input: "#cbd5e1",
        ring: "#1d4ed8",
        background: "#f8fafc",
        foreground: "#0f172a",
        institutional: {
          navy: "#0f172a",
          blue: "#1d4ed8",
          blueHover: "#1e40af",
          accentOrange: "#ea580c",
          slate: "#334155",
          lightBg: "#f1f5f9",
          border: "#e2e8f0",
        },
        primary: {
          DEFAULT: "#1d4ed8",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        accent: {
          DEFAULT: "#ea580c",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#b91c1c",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
