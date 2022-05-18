import { Component } from 'react'
import { View, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

class DeletSildeInput extends Component {
  constructor(props) {
    super(props);
    // 设置 initial state
    this.state = {
      isDelete: false,
      startX: 0
    };
    // ES6 类中函数必须手动绑定
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }
  // isDelete = false
  onTouchStart (ev) {
    if (ev.touches.length == 1) { //tounches类数组，等于1时表示此时有只有一只手指在触摸屏幕
      this.setState({'startX': ev.touches[0].clientX}) // 记录开始位置
    }
  }
  onTouchMove (ev) {
    // ev.touches.length == 1  触摸移动，当且仅当屏幕只有一个触摸点
    if (ev.touches.length == 1) {
      // 记录一次坐标值
      // this.setState({'lastX': ev.touches[0].clientX})
    }
  }
  onTouchEnd (ev) {
    // ev.changedTouches.length == 1
    // 1.一个手指触摸
    // 一个手指先触摸，另一个手指触摸，一个一个触摸，不是同时触摸
    if (ev.changedTouches.length == 1) {
      let endXTemp = ev.changedTouches[0].clientX;
      let disX = endXTemp - this.state.startX;
      // 只有滑动大于一半距离才触发
      if (Math.abs(disX) > 100) {
        if (disX < 0) {
          console.log('左滑');
          this.setState({'isDelete': true})
        } else {
          console.log('右滑');
          this.setState({'isDelete': false})
        }
      }
    }
  }
  render () {
    return (
      <View className='award-item'
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
      >
        <Input  className={'award-input' + (this.state.isDelete ? ' input-with-delete' : '')} type='text'
          value={this.props.item} onBlur={e => this.props.onChangeData(e.target.value)}
        ></Input>
        <View className={'delete-slide' + (this.state.isDelete ? ' delete-show' : '')}
          onClick={() => this.props.onDeleteClick()}
        >Delete</View>
      </View>
    )
  }
}

export default class WheelInput extends Component {
  constructor(props){
    super(props);
    this.state = {
      awards: []
    }
    this.onChangeData = this.onChangeData.bind(this)
    this.onDeleteClick = this.onDeleteClick.bind(this)
    this.addAwardItem = this.addAwardItem.bind(this)
    this.onComfirm = this.onComfirm.bind(this)
  }

  componentWillMount () {
    let awardsStorage = Taro.getStorageSync('awardsStorage')
    this.setState({awards: awardsStorage})
  }

  onChangeData (name, index) {
    console.log(name)
    let awards = this.state.awards
    awards[index].name = name
    this.setState({'awards': awards})
  }

  onDeleteClick (index) {
    let awards = this.state.awards
    awards.splice(index, 1)
    console.log('delete' + ' ' + index)
    this.setState({'awards': awards})
  }

  addAwardItem () {
    let awards = this.state.awards
    if (awards.length >= 12) {
      Taro.showToast({
        title:'The Limit is 12',
        icon: 'none',
        duration: 2000, 
      })
      return
    }
    let obj = {id: '', name: 'New', color:''}
    if (awards.length === 0) obj.id = 1
    else {
      let lastId = awards[awards.length - 1].id
      obj.id = lastId + 1
    }
    awards.push(obj)
    console.log('add new item')
    this.setState({'awards': awards})
  }

  // award 列表
  initAwardList () {
    // 状态栏高度
    let awardListData = this.state.awards
    const awardList = (
      <View class='award-list'>
        {
          awardListData.map((item, index) => {
            return <DeletSildeInput item={item.name} key={item.id}
              onDeleteClick={() => this.onDeleteClick(index)} onChangeData={name => this.onChangeData(name, index)}
            ></DeletSildeInput>
          })
        }
        <View className='award-item add-item' onClick={this.addAwardItem}>ADD</View>
      </View>
    )
    return awardList
  }

  onComfirm () {
    let awardListData = this.state.awards
    let defaultColorList = ['#D12229', '#F68A1E', '#FDE01A', '#007940', '#24408E', '#732982']
    for (let i = 0; i < awardListData.length; i++) {
      awardListData[i].color = defaultColorList[i % 6]
    }
    Taro.showToast({
      title:'Update Success',
      icon: 'success',
      duration: 2000, 
    })
    Taro.setStorageSync('awardsStorage', awardListData)
    Taro.navigateTo({
      url: '/pages/index/index',
    })
  }

  render () {
    const statusBarHeight = Taro.getStorageSync('statusBarHeight') + 'px';
    const awardList = this.initAwardList()
    return (
      <View className='wheel-input' style={{paddingTop: statusBarHeight}}>
        { awardList }
        <View class='update-circle comfirm-circle' onClick={this.onComfirm}>
          <View className='interior-circle circle'></View>
          <View className='external-circle circle'></View>
          <View className='comfirm-click'>Cofirm</View>
        </View>
      </View>
    )
  }
}