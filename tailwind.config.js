/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0B1117',         // Deep Navy Background
          surface: '#111A23',    // Card Surface
          elevated: '#16212B',   // Elevated Card Surface
          border: '#1F2A37',     // Border / Divider
          text: '#E6F1FF',       // Primary Text
          muted: '#9FB3C8',      // Secondary Text
          primary: '#00E676',    // Primary Electric Green
          darkGreen: '#00C853',  // Primary Dark Green
          teal: '#00B8D4',       // Secondary Teal / Cyan
          accent: '#EEFC07',     // Yellow Accent
        },
        status: {
          success: '#00E676',
          warning: '#FFC107',
          danger: '#FF5252',
          info: '#00B8D4',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 12px rgba(0, 230, 118, 0.25)',
        'neon-teal': '0 0 12px rgba(0, 184, 212, 0.25)',
        'card-soft': '0 4px 16px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(135deg, #00E676 0%, #00B8D4 100%)',
        'card-gradient': 'linear-gradient(180deg, #16212B 0%, #111A23 100%)',
      },
    },
  },
  plugins: [],
};
