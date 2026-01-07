module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ONE STOP Theme Colors
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        border: {
          DEFAULT: "var(--border)",
          accent: "var(--border-accent)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          violet: "var(--accent-violet)",
          pink: "var(--accent-pink)",
          blue: "var(--accent-blue)",
        },
        // Legacy support
        neonCyan: "var(--accent-cyan)",
        neonPink: "var(--accent-pink)",
      },
      boxShadow: {
        'glass': 'var(--glass-shadow)',
        'glow': 'var(--shadow-glow)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}


