module.exports = {
  mode: 'jit',
  purge: {
    enable: true,
    content: ['./src/**/*.{html,ts}']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
  prefix: 'tw',
  corePlugins: {
    preflight: false,
  },
  important: true,
}
