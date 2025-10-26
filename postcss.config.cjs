module.exports = {
  plugins: {
    // 1. This plugin loads your custom settings from tailwind.config.cjs
    // and compiles the @tailwind directives into actual CSS.
    tailwindcss: {},

    // 2. This plugin automatically adds vendor prefixes (like -webkit- and -moz-)
    // for broader browser compatibility.
    autoprefixer: {},
  },
};
