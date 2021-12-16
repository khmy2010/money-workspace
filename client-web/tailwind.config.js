module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{html,ts}'
  ],
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
