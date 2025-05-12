/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-gradient-to-r',
    // Explicitly list all from/to classes
    'from-lime-50', 'to-lime-100',
    'from-green-100', 'to-green-200',
    'from-emerald-100', 'to-emerald-200',
    'from-teal-100', 'to-teal-200',
    'from-cyan-100', 'to-cyan-200',
    'from-sky-100', 'to-sky-200',
    'from-lime-100', 'to-lime-200',
    // Note: from-green-100, to-green-200 is repeated for "חופשית" - already listed
    // Note: from-emerald-100, to-emerald-200 is repeated for "ספורט" - already listed
    // Note: from-teal-100, to-teal-200 is repeated for "גמר" - already listed
    'from-gray-100', 'to-gray-200',

    // Safelist text colors (keeping the pattern for these as it's less likely to be the issue)
    {
      pattern: /text-(lime|green|emerald|teal|cyan|sky|gray)-(700|800)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Custom Green/Olive Gradient Palette from Image
        'olive-100': '#95b469',
        'olive-200': '#85a05e',
        'olive-300': '#748c52',
        'olive-400': '#647846',
        'olive-500': '#53643b',
        'olive-600': '#42502f',
        'olive-700': '#323c23',
        'olive-800': '#212817',
        'olive-900': '#11140c',
        // Consider adding a very dark/black if needed, e.g.:
        // 'olive-black': '#000000',
      }
    },
  },
  plugins: [],
}