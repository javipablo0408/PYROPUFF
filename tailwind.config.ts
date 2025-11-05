import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pyro-black': '#000000',
        'pyro-gold': '#E6B422',
        'pyro-gray': '#F5F5F5',
        'pyro-white': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'Urbanist', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config


