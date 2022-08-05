
// eslint-disable-next-line no-undef
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/index/wheel-input'
    // 'pages/dice/dice',
    // 'pages/dice/threeJS'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  subpackages: [
    {
      root: 'pages/dice/',
      name: 'dic',
      pages: [
        'dice'
      ],
      independent: true
    }
  ],
  lazyCodeLoading: "requiredComponents"
})
