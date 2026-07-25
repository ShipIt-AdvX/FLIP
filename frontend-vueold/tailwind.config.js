/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          teal: '#00e5c8',
          'teal-dim': '#00b89e',
          amber: '#ffb800',
          'amber-dim': '#cc9300',
          smoke: '#0d1117',
          'smoke-light': '#161b22',
          'smoke-card': '#1c2333',
          'smoke-border': '#2a3444',
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'scan': 'scan 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out both',
        'slide-up': 'slideUp 0.5s ease-out both',
        'slide-up-delay': 'slideUp 0.5s ease-out 0.2s both',
        'typing-dot': 'typingDot 1.4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'reveal': 'reveal 0.8s ease-out both',
        'counter-tick': 'counterTick 0.15s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        typingDot: {
          '0%, 60%, 100%': { opacity: '0.2', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-4px)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 4px rgba(0, 229, 200, 0.3), 0 0 12px rgba(0, 229, 200, 0.1)' },
          '100%': { boxShadow: '0 0 8px rgba(0, 229, 200, 0.5), 0 0 24px rgba(0, 229, 200, 0.2)' },
        },
        reveal: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        counterTick: {
          '0%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
