/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/Components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(30px) translateX(20px)' },
          '50%': { transform: 'translateY(0px) translateX(40px)' },
          '75%': { transform: 'translateY(-30px) translateX(20px)' },
          '100%': { transform: 'translateY(0px) translateX(0px)' },
        },
        loadingProgress: {
          '0%': { width: '0%', marginLeft: '0%' },
          '50%': { width: '40%', marginLeft: '60%' },
          '100%': { width: '0%', marginLeft: '100%' }
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%) translateX(-50%)' },
          '100%': { transform: 'translateY(50%) translateX(-50%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'float': 'float 15s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
