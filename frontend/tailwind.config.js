/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6FCB6C', // Using the color you specified
        secondary: '#2C4F6A',
        muted: '#F4F4F4',
        'text-main': '#333333',
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
        body: ['Arial', 'sans-serif'],
      },
      // Add the following animation config
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },  
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}