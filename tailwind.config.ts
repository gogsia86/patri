import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg0: 'var(--bg0)',
        bg1: 'var(--bg1)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        termGreen: 'var(--termGreen)',
        termAmber: 'var(--termAmber)',
      },
      boxShadow: {
        pixel: '0 0 0 2px #020204, 0 0 0 4px #1c1c24, inset -2px -2px 0 #020204, inset 2px 2px 0 #404050',
      },
      backgroundImage: {
        iso:
          'linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.04) 75%, transparent 75%, transparent)',
      },
    },
  },
  plugins: [],
};

export default config;
