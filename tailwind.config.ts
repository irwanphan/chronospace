import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        colors: {
          blue: {
            50: '#EBF5FF',
            100: '#D7E9FF',
            200: '#B3D4FF',
            300: '#85BDFF',
            400: '#4D9BFF',
            500: '#1477FF',
            600: '#0D5ECC',
            700: '#0A47A3',
            800: '#07357A',
            900: '#052452',
          },
        },
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'Circular', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
