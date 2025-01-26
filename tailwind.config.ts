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
          theme: {
            50: '#EBF4FF',   // Lightest blue for subtle backgrounds
            100: '#D7E9FF',  // Very light blue
            200: '#B3D4FF',  // Light blue
            300: '#85BDFF',  // Medium light blue
            400: '#4D9BFF',  // Light medium blue
            500: '#1477FF',  // Primary blue
            600: '#0D5ECC',  // Slightly darker
            700: '#0A47A3',  // Darker blue for hover
            800: '#07357A',  // Very dark blue
            900: '#052452',  // Darkest blue
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
