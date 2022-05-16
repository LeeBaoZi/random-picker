import { Component } from 'react'
import Taro from '@tarojs/taro'
import './app.less'

class App extends Component {

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  onLaunch () {
    const { statusBarHeight, platform } = Taro.getSystemInfoSync()
    const { top, height } = Taro.getMenuButtonBoundingClientRect()

    // 状态栏高度
    Taro.setStorageSync('statusBarHeight', statusBarHeight)
    // 胶囊按钮高度 一般是32 如果获取不到就使用32
    Taro.setStorageSync('menuButtonHeight', height ? height : 32)
    
    // 判断胶囊按钮信息是否成功获取
    if (top && top !== 0 && height && height !== 0) {
        const navigationBarHeight = (top - statusBarHeight) * 2 + height
        // 导航栏高度
        Taro.setStorageSync('navigationBarHeight', navigationBarHeight)
    } else {
        Taro.setStorageSync(
          'navigationBarHeight',
          platform === 'android' ? 48 : 40
        )
    }
  }

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
