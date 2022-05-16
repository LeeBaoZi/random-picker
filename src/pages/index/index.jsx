import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Canvas  } from '@tarojs/components'
import './index.less'

export default class Index extends Component {

  constructor(props){
    super(props);
    this.state = {
      awards: [
        {id: 1, name: 'First', level: '1', color:"#D12229"},
        {id: 2, name: '二等奖', level: '2', color:"#F68A1E"},
        {id: 3, name: '三等奖', level: '3', color:"#FDE01A"},
        {id: 4, name: '四等奖', level: '4', color:"#007940"},
        {id: 5, name: '五等奖', level: '5', color:"#24408E"},
        {id: 6, name: '六等奖', level: '6', color:"#732982"},
      ],//大转盘的奖品列表
      // animation: true,
      // fileRootPath: "",//"http://co.dev.touty.io"
      startRadian: -90 * Math.PI / 180,//大转盘的开始弧度(canvas绘制圆从水平方向开始，所以这里调整为垂直方向) 弧度计算公式：角度*Math.PI/180
      canBeClick: true,//判断抽奖有没有结束
      // canvas: '',
      // context: '',
      screenWidth: '',
    }
  }

  componentWillMount () {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.getSystemInfo({
        success: (res) => {
          this.setState({screenWidth: res.windowWidth - 50})
          console.log(res.windowWidth)
        }
      })
    }
  }

  componentDidMount () { 
    if (process.env.TARO_ENV === 'weapp') this.onLoadPage(this.state.awards, this.state.startRadian);
    else if (process.env.TARO_ENV === 'h5') {
      Taro.getSystemInfo({
        success: (res) => {
          this.setState({screenWidth: res.windowWidth - 50})
          this.onLoadPage(this.state.awards, this.state.startRadian);
          console.log(res.windowWidth)
        }
      })
    }
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  onLoadPage(awards, startRadianTemp) {
    // let {startRadian} = this.state;
    let startRadian = startRadianTemp + 90 * Math.PI / 180
    let context
    // 获取canvas的上下文,context含有各种api用来操作canvas
    if (process.env.TARO_ENV === 'weapp') {
      context = Taro.createCanvasContext('wheelcanvas', this.$scope);
    } else if (process.env.TARO_ENV === 'h5') {
      let canvas = document.getElementById('wheelcanvas');
      context = canvas.getContext('2d');
    }
    // this.setState({context: context});
    context.save();
    // 新建一个路径,画笔的位置回到默认的坐标(0,0)的位置
    // 保证了当前的绘制不会影响到之前的绘制
    context.beginPath();
    // 设置填充转盘用的颜色,fill是填充而不是绘制
    context.fillStyle = '#fff';
    const width = this.state.screenWidth
    // 绘制一个圆,有六个参数,分别表示:圆心的x坐标,圆心的y坐标,圆的半径,开始绘制的角度,结束的角度,绘制方向(false表示顺时针)
    context.arc(0, width, width, startRadian, Math.PI * 2 + startRadian, false);
    // 将设置的颜色填充到圆中,这里不用closePath是因为closePath对fill无效.
    context.fill();

    // 将画布的状态恢复到上一次save()时的状态
    context.restore();
    // 第一个奖品色块开始绘制时开始的弧度及结束的弧度
    let RadianGap = Math.PI * 2 / awards.length, endRadian = startRadian + RadianGap;
    for (let i = 0; i < awards.length; i++) {
      context.save();
      context.beginPath();
      // 为了区分不同的色块,使用随机生成的颜色作为色块的填充色
      context.fillStyle = awards[i].color;
      // 这里需要使用moveTo方法将初始位置定位在圆点处,这样绘制的圆弧都会以圆点作为闭合点
      context.moveTo(0, width);
      // 画圆弧时,每次都会自动调用moveTo,将画笔移动到圆弧的起点,半径设置的比转盘稍小一点
      context.arc(0, width, width - 10, startRadian, endRadian, false);
      context.fill();
      context.restore();
      // 开始绘制文字
      context.save();
      //设置文字颜色
      context.fillStyle = '#FFFFFF';
      //设置文字样式
      context.font = "18px Arial";
      // 改变canvas原点的位置,简单来说,translate到哪个坐标点,那么那个坐标点就将变为坐标(0, 0)
      context.translate(
        0 + Math.cos(startRadian + RadianGap / 2) * (width - 15),
        width + Math.sin(startRadian + RadianGap / 2) * (width - 15)
      )
      // 旋转角度,这个旋转是相对于原点进行旋转的.
      context.rotate(startRadian + RadianGap / 2 + Math.PI / 2);
      // 这里就是根据获取的各行的文字进行绘制,maxLineWidth取70,相当与一行最多展示5个文字
      this.getLineTextList(context, awards[i].name, 120).forEach((line, index) => {
        // 绘制文字的方法,三个参数分别带:要绘制的文字,开始绘制的x坐标,开始绘制的y坐标
        context.fillText(line, -context.measureText(line).width / 2, ++index * 25)
      });
      context.restore();
      // 每个奖品色块绘制完后,下个奖品的弧度会递增
      startRadian += RadianGap;
      endRadian += RadianGap;
    }
    //下面是画中间的小圆
    context.save();
    // 新建一个路径,画笔的位置回到默认的坐标(0,0)的位置
    // 保证了当前的绘制不会影响到之前的绘制
    context.beginPath();
    // 设置填充转盘用的颜色,fill是填充而不是绘制
    context.fillStyle = '#fff';
    // 绘制一个圆,有六个参数,分别表示:圆心的x坐标,圆心的y坐标,圆的半径,开始绘制的角度,结束的角度,绘制方向(false表示顺时针)
    context.arc(0, width, 120, startRadian, Math.PI * 2 + startRadian, false);
    // 将设置的颜色填充到圆中,这里不用closePath是因为closePath对fill无效.
    context.fill();
    // 将画布的状态恢复到上一次save()时的状态
    context.restore();
    if (process.env.TARO_ENV === 'weapp') {
      console.log('wx-draw')
      context.draw();
    }
  }

  //绘制文字，文字过长进行换行，防止文字溢出
  getLineTextList(context, text, maxLineWidth) {
    let wordList = text.split(''), tempLine = '', lineList = [];
    for (let i = 0; i < wordList.length; i++) {
      if (context.measureText(tempLine).width >= maxLineWidth) {
        lineList.push(tempLine);
        maxLineWidth -= context.measureText(text[0]).width;
        tempLine = ''
      }
      tempLine += wordList[i]
    }
    lineList.push(tempLine);
    return lineList
  }

  // 这个方法是为了将canvas再window中的坐标点转化为canvas中的坐标点
  windowToCanvas(canvas, e) {
    // getBoundingClientRect这个方法返回html元素的大小及其相对于视口的位置
    const canvasPostion = canvas.getBoundingClientRect(), x = e.clientX, y = e.clientY;
    return {
      x: x - canvasPostion.left,
      y: y - canvasPostion.top
    }
  };

  //点击抽奖让转盘转起来
  draw () {
    // 只要抽奖没有结束，就不让再次抽奖
    if (!this.state.canBeClick) return;
    this.setState({canBeClick: false});
    // 每次点击抽奖，都将初始化角度重置
    // this.setState({startRadian: -90 * Math.PI / 180});
    const distance = this.distanceToStop();
    this.rotatePanel(distance, this.state.startRadian);//调用处理旋转的方法
  }

  // 处理旋转的关键方法
  rotatePanel(distance, startRadian) {
    // 这里用一个很简单的缓动函数来计算每次绘制需要改变的角度，这样可以达到一个转盘从块到慢的渐变的过程
    let changeRadian = (distance - startRadian) / 20;
    // this.state.startRadian += changeRadian;
    let startRadianTemp = startRadian + changeRadian;
    // 当最后的目标距离与startRadian之间的差距低于0.0001时，就默认奖品抽完了，可以继续抽下一个了。
    if (distance - startRadianTemp <= 0.001) {
      this.setState({canBeClick: true});
      return
    };
    // 初始角度改变后，需要重新绘制
    this.onLoadPage(this.state.awards, startRadianTemp);
    // 循环调用rotatePanel函数，使得转盘的绘制连续，造成旋转的视觉效果
    window.requestAnimationFrame(this.rotatePanel.bind(this, distance, startRadianTemp));
  }

  distanceToStop() {
    // middleDegrees为奖品块的中间角度（最终停留都是以中间角度进行计算的）距离初始的startRadian的距离，distance就是当前奖品跑到指针位置要转动的距离。
    let middleDegrees = 0, distance = 0;
    // 映射出每个奖品的middleDegrees
    let awardsToDegreesList = this.state.awards.map((data, index) => {
      let awardRadian = (Math.PI * 2) / this.state.awards.length;
      return awardRadian * index + (awardRadian * (index + 1) - awardRadian * index) / 2
    });
  
    // 随机生成一个索引值，来表示此次抽奖应该中的奖品
    const currentPrizeIndex = Math.floor(Math.random() * this.state.awards.length);
    console.log('当前奖品应该中的奖品是：' + this.state.awards[currentPrizeIndex].name);
    middleDegrees = awardsToDegreesList[currentPrizeIndex];
    // 因为指针是垂直向上的，相当坐标系的Math.PI/2,所以这里要进行判断来移动角度
    distance = Math.PI * 3 / 2 - middleDegrees;
    distance = distance > 0 ? distance : Math.PI * 2 + distance;
    // 这里额外加上后面的值，是为了让转盘多转动几圈，看上去更像是在抽奖
    return distance + Math.PI * 10;
  }

  // 打开数据输入框
  openUpdate () {
    Taro.navigateTo({
      url: '/pages/index/wheel-input',
    })
  }

  // 自定义导航
  customTopBar () {
    // 导航高度
    // 状态栏高度
    const statusBarHeight = Taro.getStorageSync('statusBarHeight') + 'px';
    // 导航栏高度
    const navigationBarHeight = Taro.getStorageSync('navigationBarHeight') + 'px';
    // 胶囊按钮高度
    // const menuButtonHeight = Taro.getStorageSync('menuButtonHeight') + 'px';
    // 导航栏和状态栏高度
    // const navigationBarAndStatusBarHeight = Taro.getStorageSync('statusBarHeight') + Taro.getStorageSync('navigationBarHeight') + 'px'
    const topBar = (
      <View className='top-bar' style={{paddingTop: statusBarHeight}}>
        <View style={{height: navigationBarHeight}}>The Item</View>
      </View>
    )
    return topBar
  }

  render () {
    const topBar = this.customTopBar()

    let wheel
    if (process.env.TARO_ENV === 'weapp') {
      console.log('weapp')
      wheel = (
        <View className='wheel'>
          <Canvas className='item' id='wheelcanvas' canvas-id='wheelcanvas'
            style={{ width: this.state.screenWidth * 2 + 'px',height: this.state.screenWidth * 2 + 'px' }}
          />
          <View onClick={this.draw.bind(this)} className='pointer start start-weapp' >
            <View class='start-png'></View>
          </View>
        </View>
      )
    } else if (process.env.TARO_ENV === 'h5') {
      console.log('h5')
      wheel = (
        <View className='wheel'>
          <canvas className='item' id='wheelcanvas' width={this.state.screenWidth * 2} height={this.state.screenWidth * 2} />
          <View onClick={this.draw.bind(this)} className='pointer start' >
            <svg viewBox='0 0 100 100'>
              <path d='M 0,50 a 50,50 0 1, 1 0, 1 z' id='circle1'></path>
              <text>
                <textPath xlinkHref='#circle1'>
                  START&nbsp;&nbsp;START&nbsp;&nbsp;START
                </textPath>
              </text>
            </svg>
          </View>
        </View>
      )
    }
    return (
      <View className='index'>
       { topBar }
       { wheel }
       <View className='chosen'>Chosen</View>
       <View className='update-button'>
         <View class='update-title'>
          <View class='text'>Click Here To Input Your Data</View>
         </View>
         <View class='update-circle'>
           <View className='interior-circle circle'></View>
           <View className='external-circle circle'></View>
           <View className='circle-click' onClick={this.openUpdate}>Click</View>
         </View>
       </View>
      </View>
    )
  }
}
