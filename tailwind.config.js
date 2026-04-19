/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      keyframes: {
        'hero-orbit-spin-cw': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'hero-orbit-spin-ccw': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
        'hero-orbit-spin-cw-osc': {
          '0%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(48deg)' },
          '50%': { transform: 'rotate(198deg)' },
          '80%': { transform: 'rotate(320deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'hero-orbit-spin-ccw-osc': {
          '0%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-48deg)' },
          '50%': { transform: 'rotate(-198deg)' },
          '80%': { transform: 'rotate(-320deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'hero-orbit-counter-cw': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
        'hero-orbit-counter-ccw': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'hero-orbit-counter-cw-osc': {
          '0%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-48deg)' },
          '50%': { transform: 'rotate(-198deg)' },
          '80%': { transform: 'rotate(-320deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'hero-orbit-counter-ccw-osc': {
          '0%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(48deg)' },
          '50%': { transform: 'rotate(198deg)' },
          '80%': { transform: 'rotate(320deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'hero-orbit-spin-cw':
          'hero-orbit-spin-cw var(--hero-orbit-duration, 14s) linear infinite',
        'hero-orbit-spin-ccw':
          'hero-orbit-spin-ccw var(--hero-orbit-duration, 14s) linear infinite',
        'hero-orbit-spin-cw-osc':
          'hero-orbit-spin-cw-osc var(--hero-orbit-duration, 14s) ease-in-out infinite',
        'hero-orbit-spin-ccw-osc':
          'hero-orbit-spin-ccw-osc var(--hero-orbit-duration, 14s) ease-in-out infinite',
        'hero-orbit-counter-cw':
          'hero-orbit-counter-cw var(--hero-orbit-duration, 14s) linear infinite',
        'hero-orbit-counter-ccw':
          'hero-orbit-counter-ccw var(--hero-orbit-duration, 14s) linear infinite',
        'hero-orbit-counter-cw-osc':
          'hero-orbit-counter-cw-osc var(--hero-orbit-duration, 14s) ease-in-out infinite',
        'hero-orbit-counter-ccw-osc':
          'hero-orbit-counter-ccw-osc var(--hero-orbit-duration, 14s) ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        hover: "#00aeef",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}