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
        paper: "#F7F0E3",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#231F20",
          soft: "#3D3638",
          muted: "#4A4244",
        },
        yellow: {
          DEFAULT: "#F2B84B",
          hover: "#E5AA3D",
        },
        coral: {
          DEFAULT: "#D9482B",
          hover: "#C43D22",
        },
        sage: {
          DEFAULT: "#9CC5A1",
          light: "#CFE8D3",
        },
        sky: {
          DEFAULT: "#A9D4E8",
          hover: "#93C4DA",
        },
        blush: {
          DEFAULT: "#F9D3C7",
        },
        note: {
          yellow: "#FFF8DC",
          sage: "#CFE8D3",
          blush: "#F9D3C7",
        },
        dark: {
          bg: "#231F20",
          sub: "#D9D0C0",
        },
        cream: "#F7F0E3",
        // Backward-compatible mappings
        brand: {
          50: "#FFF8DC",
          100: "#F7F0E3",
          500: "#F2B84B",
          600: "#231F20",
          700: "#231F20",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        hand: ["var(--font-caveat)", "Caveat", "cursive"],
      },
      boxShadow: {
        "hard-card": "5px 5px 0 #231F20",
        "hard-btn": "3px 3px 0 #231F20",
        "hard-btn-primary": "3px 3px 0 #D9482B",
        "hard-btn-pressed": "1px 1px 0 #231F20",
        "hard-cta": "8px 8px 0 #231F20",
        "hard-note": "4px 6px 0 rgba(0,0,0,0.25)",
      },
      borderWidth: {
        "2.5": "2.5px",
        "3": "3px",
        "3.5": "3.5px",
      },
      borderRadius: {
        card: "24px",
        input: "12px",
        note: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
