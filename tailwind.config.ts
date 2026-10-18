import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#0B0F19",
        card: {
          DEFAULT: "#131B2E",
          subtle: "#162036",
          border: "rgba(51, 65, 85, 0.75)",
        },
        accent: {
          cyan: "#0EA5E9",
          sky: "#38BDF8",
          emerald: "#10B981",
          teal: "#14B8A6",
          mint: "#34D399",
          amber: "#F59E0B",
          coral: "#FB7185",
          orange: "#F97316",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        glowCyan: "0 0 20px -3px rgba(14, 165, 233, 0.45)",
        glowEmerald: "0 0 20px -3px rgba(16, 185, 129, 0.45)",
        glowAmber: "0 0 20px -3px rgba(245, 158, 11, 0.4)",
        glowRose: "0 0 20px -3px rgba(244, 63, 94, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
