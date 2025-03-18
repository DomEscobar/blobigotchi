import { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        'crt-dark': '#171717',
        'crt-background': '#1f2023',
        'blob-primary': '#8B5CF6',
        'blob-secondary': '#EC4899',
        'blob-tertiary': '#aa55ff',
        'blob-happy': '#facc15',
        'blob-sad': '#60a5fa',
        'blob-hungry': '#EF4444',
        'blob-tired': '#94a3b8',
        'blob-sick': '#65a30d',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "blob-idle": {
          "0%, 100%": { transform: "scale(1) translateY(0)" },
          "50%": { transform: "scale(1.05) translateY(-5px)" },
        },
        "blob-sad": {
          "0%, 100%": { transform: "scale(0.95) translateY(0)" },
          "50%": { transform: "scale(1) translateY(-2px)" },
        },
        "blob-bounce": {
          "0%": { transform: "scale(1) translateY(0)" },
          "50%": { transform: "scale(1.2) translateY(-15px)" },
          "100%": { transform: "scale(1) translateY(0)" },
        },
        "blob-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        "led-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shake": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-15deg)" },
          "75%": { transform: "rotate(15deg)" },
        },
        "progress": {
          "0%": { width: "0%" },
          "50%": { width: "70%" },
          "70%": { width: "40%" },
          "100%": { width: "100%" },
        },
        "button-press": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "fire-attack": {
          "0%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
          "100%": { opacity: "0", transform: "scale(0)" },
        },
        "water-attack": {
          "0%": { opacity: "0", transform: "translateY(-50px)" },
          "50%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(50px)" },
        },
        "electric-attack": {
          "0%": { opacity: "0" },
          "10%": { opacity: "1" },
          "20%": { opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "grass-attack": {
          "0%": { opacity: "0", transform: "rotate(0deg) scale(0)" },
          "50%": { opacity: "1", transform: "rotate(180deg) scale(1.2)" },
          "100%": { opacity: "0", transform: "rotate(360deg) scale(0)" },
        },
        "ice-attack": {
          "0%": { opacity: "0", filter: "blur(8px)" },
          "50%": { opacity: "1", filter: "blur(0)" },
          "100%": { opacity: "0", filter: "blur(8px)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blob-idle": "blob-idle 3s ease-in-out infinite",
        "blob-sad": "blob-sad 4s ease-in-out infinite",
        "blob-bounce": "blob-bounce 0.5s ease-in-out",
        "blob-shake": "blob-shake 0.5s ease-in-out",
        "led-blink": "led-blink 1.5s ease-in-out infinite",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "shake": "shake 0.5s ease-in-out",
        "progress": "progress 2s ease-in-out infinite",
        "button-press": "button-press 0.3s ease-out",
        "fire-attack": "fire-attack 1s ease-out forwards",
        "water-attack": "water-attack 1s ease-out forwards",
        "electric-attack": "electric-attack 0.8s ease-out forwards",
        "grass-attack": "grass-attack 1s ease-out forwards",
        "ice-attack": "ice-attack 1s ease-out forwards",
        "normal-attack": "button-press 0.5s ease-out",
        "fighting-attack": "shake 0.5s ease-out",
        "poison-attack": "button-press 0.5s ease-out",
        "ghost-attack": "button-press 0.5s ease-out",
        "psychic-attack": "button-press 0.5s ease-out"
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;

export default config;
