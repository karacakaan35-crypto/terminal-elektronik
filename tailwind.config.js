/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        terminal: '0 0 34px rgba(34, 197, 94, 0.16)',
        danger: '0 0 30px rgba(239, 68, 68, 0.18)',
      },
    },
  },
  plugins: [],
}
