module.exports = {
  // CRITICAL: This 'content' array tells Tailwind where to find your utility classes (in .jsx, .js, etc. files).
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom colors or fonts can go here, but we'll leave it empty for now.
    },
  },
  plugins: [],
};
