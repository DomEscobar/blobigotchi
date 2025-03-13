
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Tamagotchi-inspired color palette
				blob: {
					primary: '#ff55aa',
					secondary: '#55ffee',
					tertiary: '#aa55ff',
					happy: '#ff9955',
					sad: '#5599ff',
					hungry: '#ff5555',
					tired: '#aa99ff',
					sick: '#55ff55'
				},
				crt: {
					dark: '#121317',
					glow: '#33ffaa',
					scanline: 'rgba(0, 0, 0, 0.1)',
					background: '#1a1a24',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				// Blob animations
				'blob-idle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'blob-bounce': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' }
				},
				'blob-sad': {
					'0%, 100%': { transform: 'translateY(0) scale(0.95)' },
					'50%': { transform: 'translateY(3px) scale(0.9)' }
				},
				// CRT effects
				'scanline': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'screen-flicker': {
					'0%, 100%': { opacity: '1' },
					'92%, 98%': { opacity: '0.95' }
				},
				// Status and interaction animations
				'bar-decrease': {
					'0%': { width: 'var(--initial-width)' },
					'100%': { width: 'var(--target-width)' }
				},
				'pixel-pop': {
					'0%': { transform: 'scale(0.95)', opacity: '0.5' },
					'50%': { transform: 'scale(1.1)', opacity: '1' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'glitch': {
					'0%, 100%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-2px, 2px)' },
					'40%': { transform: 'translate(-2px, -2px)' },
					'60%': { transform: 'translate(2px, 2px)' },
					'80%': { transform: 'translate(2px, -2px)' }
				},
				'led-blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'blob-idle': 'blob-idle 3s ease-in-out infinite',
				'blob-bounce': 'blob-bounce 0.5s ease-in-out',
				'blob-sad': 'blob-sad 2s ease-in-out infinite',
				'scanline': 'scanline 10s linear infinite',
				'screen-flicker': 'screen-flicker 5s ease-in-out infinite',
				'bar-decrease': 'bar-decrease 1s ease-out forwards',
				'pixel-pop': 'pixel-pop 0.3s ease-out',
				'glitch': 'glitch 0.2s ease-in-out',
				'led-blink': 'led-blink 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
