import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media', // Use system preference for dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Claude's color palette
        claude: {
          rust: '#f7931e',      // Bright Orange - Primary brand color
          cream: '#F4F3EE',     // Pampas - off-white background
          grey: '#B1ADA1',      // Cloudy - light grey
          'dark-bg': '#1E1E1E', // Dark background for dark mode
          'dark-card': '#2A2A2A', // Dark cards
          'dark-border': '#404040', // Dark borders
          'text-primary': '#2D2D2D', // Dark text on light
          'text-secondary': '#666666', // Muted text
          'text-on-dark': '#F4F3EE', // Light text on dark
        },
        // Keep existing theme colors but map to Claude palette
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#f7931e',
          foreground: '#F4F3EE',
        },
        secondary: {
          DEFAULT: '#B1ADA1',
          foreground: '#2D2D2D',
        },
        muted: {
          DEFAULT: '#F4F3EE',
          foreground: '#666666',
        },
        accent: {
          DEFAULT: '#f7931e',
          foreground: '#F4F3EE',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: '#B1ADA1',
        input: '#F4F3EE',
        ring: '#f7931e',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
export default config
