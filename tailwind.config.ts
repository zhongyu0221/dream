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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 1s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'gentle-pulse': 'gentlePulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'dreamy-float': 'dreamyFloat 4s ease-in-out infinite',
        'dreamy-glow': 'dreamyGlow 3s ease-in-out infinite',
        'dreamy-rotate': 'dreamyRotate 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        particleMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
        ambientFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.5' },
          '33%': { transform: 'translate(100px, -50px) scale(1.1)', opacity: '0.7' },
          '66%': { transform: 'translate(-50px, 100px) scale(0.9)', opacity: '0.6' },
        },
        dreamyFloat: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.05)' },
        },
        dreamyGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(122, 155, 122, 0.3), 0 0 60px rgba(107, 141, 184, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.6), 0 0 60px rgba(122, 155, 122, 0.5), 0 0 90px rgba(107, 141, 184, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.15)',
          },
        },
        dreamyRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(1.5)',
            opacity: '0',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        serif: ['Georgia', 'Palatino', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config

