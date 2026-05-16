import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0f0f12',
        panel:   '#1a1a22',
        border:  '#2a2a36',
        accent:  '#7c6af7',
        'accent-dim': '#4a3fa8',
        muted:   '#6b6b80',
      },
    },
  },
  plugins: [],
};

export default config;
