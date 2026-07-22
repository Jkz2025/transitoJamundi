/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#F2B705',
        'gold-600': '#D49E00',
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          400: '#829AB1',
          600: '#486581',
          700: '#334E68',
          900: '#102A43',
        },
        teal: '#00D4AA',
      },
      fontFamily: {
        display: ['system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(16, 42, 67, 0.1), 0 1px 2px 0 rgba(16, 42, 67, 0.06)',
      },
    },
  },
  plugins: [],
}
