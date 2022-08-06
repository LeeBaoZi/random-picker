import { Component } from 'react'
// import anime from 'animejs/lib/anime.es.js';
import { View, Canvas, CoverView, Button  } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { OrbitControls } from '../../libs/OrbitControls'
import * as THREE from '../../libs/three.weapp.min.js';
import './dice.less'

export default class Dice extends Component {
  constructor(props){
    super(props);
    this.state = {
      dice: null,
      canvasId: ''
    }
  }

  componentDidMount () { 
  }

  componentWillUnmount () { 
    THREE.global.unregisterCanvas(this.state.canvasId)
  }

  onReady  () {
    Taro.createSelectorQuery().select('#canvas').fields({ node: true }, res => {
      const canvas = THREE.global.registerCanvas(res.node)
      this.setState({ canvasId: canvas._canvasId })
      // const canvas = THREE.global.registerCanvas('id_123', res[0].node)
      // canvas代码
      // this.init(res.node);
      this.initThreeScene(res.node)
    }).exec()
  }

  createBoxWithRoundedEdges (width, height, depth, radius0, smoothness) {
    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(
      width - radius * 2,
      height - radius * 2,
      eps,
      Math.PI / 2,
      0,
      true
    );
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    let geometry = new THREE.ExtrudeBufferGeometry(shape, {
      // amount: depth - radius0 * 2,
      depth: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness
    });

    geometry.center();

    return geometry;
  }
  createDiceMat (num) {
    const texSize = 256;
    const circSize = 20;
  
    const offscreenCanvas = Taro.createOffscreenCanvas({
      type: '2d',
      width: texSize,
      height: texSize
    })
    // const ctx = Taro.createCanvasContext('wheelcanvas', this.$scope);
    // canvas.width = texSize;
    // canvas.height = texSize;
    // DOM.appendChild(canvas);
    const ctx = offscreenCanvas.getContext('2d');
    const canvas = ctx.canvas
  
    ctx.beginPath();
    ctx.fillStyle = `#f8f8f6`;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
  
    if (num == 1) {
      ctx.fillStyle = `rgb(0, 0, 0)`;
      ctx.beginPath();
      ctx.arc(0.5 * texSize, 0.5 * texSize, circSize, 0, 2 * Math.PI);
      ctx.fill();
    } else if (num == 2) {
      ctx.fillStyle = `rgb(0, 0, 0)`;
      ctx.beginPath();
      ctx.arc(0.5 * texSize + 40, 0.5 * texSize - 40, circSize, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0.5 * texSize - 40, 0.5 * texSize + 40, circSize, 0, 2 * Math.PI);
      ctx.fill();
    } else if (num == 3) {
      ctx.fillStyle = `rgb(0, 0, 0)`;
      ctx.beginPath();
      ctx.arc(0.5 * texSize + 40, 0.5 * texSize - 40, circSize, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0.5 * texSize - 40, 0.5 * texSize + 40, circSize, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0.5 * texSize, 0.5 * texSize, circSize, 0, 2 * Math.PI);
      ctx.fill();
    } else if (num == 4) {
      for (let c = 1; c <= 2; c++) {
        for (let r = 1; r <= 2; r++) {
          ctx.fillStyle = `rgb(0, 0, 0)`;
          ctx.beginPath();
          ctx.arc((c * texSize) / 3, (r * texSize) / 3, circSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
  
      ctx.fillStyle = `rgb(0, 0, 0)`;
      ctx.beginPath();
      ctx.arc(0.5 * texSize, 0.5 * texSize, circSize, 0, 2 * Math.PI);
      ctx.fill();
    } else if (num == 5) {
      for (let c = 1; c <= 2; c++) {
        for (let r = 1; r <= 2; r++) {
          ctx.fillStyle = `rgb(0, 0, 0)`;
          ctx.beginPath();
          ctx.arc((c * texSize) / 3, (r * texSize) / 3, circSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else if (num == 6) {
      for (let c = 1; c <= 2; c++) {
        for (let r = 1; r <= 3; r++) {
          ctx.fillStyle = `rgb(0, 0, 0)`;
          ctx.beginPath();
          ctx.arc((c * texSize) / 3, (r * texSize) / 4, circSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  
    const mat = new THREE.MeshLambertMaterial();
    mat.map = new THREE.CanvasTexture(ctx.canvas);
  
    // DOM.removeChild(canvas);
  
    return mat;
  }

  // Create a Three scene
  initThreeScene (canvasNode) {
    // debugger
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasNode
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xddcccc);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    // DOM.appendChild(renderer.domElement);

    // The dice
    const diceGeom = this.createBoxWithRoundedEdges(20, 20, 20, 3, 9);
    const diceMat = new THREE.MeshPhongMaterial({
      color: 0xf8f8f6,
      specular: 0x050505,
      shininess: 100
    });
    const dice = new THREE.Mesh(diceGeom, diceMat);
    dice.castShadow = true;
    scene.add(dice);

    // Put six above
    dice.rotation.y = 0.5 * Math.PI;

    /**
     * These boxes are needed because the dice is an extrude geometry that has
     * a different approach to faces and is thus not texturable like a box geometry.
     * So, they are purely here for the (number) textures
     */
    console.log(this.createDiceMat(1))
    const tp1Geom = new THREE.BoxGeometry(20.01, 14, 14);
    const tp1Mat = [this.createDiceMat(1), this.createDiceMat(6)];
    const tp1 = new THREE.Mesh(tp1Geom, tp1Mat);
    dice.add(tp1);

    const tp2Geom = new THREE.BoxGeometry(14, 20.01, 14);
    const tp2Mat = [null, null, this.createDiceMat(2), this.createDiceMat(5)];
    const tp2 = new THREE.Mesh(tp2Geom, tp2Mat);
    dice.add(tp2);

    const tp3Geom = new THREE.BoxGeometry(14, 14, 20.01);
    const tp3Mat = [null, null, null, null, this.createDiceMat(3), this.createDiceMat(4)];
    const tp3 = new THREE.Mesh(tp3Geom, tp3Mat);
    dice.add(tp3);

    // Position camera
    camera.position.z = 80;

    // Scene lighting
    const ambientLight = new THREE.AmbientLight(0x303030);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xf8f6f6, 1);
    light.position.set(-40, -40, 120);
    light.castShadow = true;
    light.target = dice;
    scene.add(light);

    const light2 = new THREE.DirectionalLight(0xf8f6f6, 1);
    light2.position.set(30, 30, -120);
    light2.castShadow = true;
    light2.target = dice;
    scene.add(light2);

    // Orbital cam
    const controls = new OrbitControls(camera, renderer.domElement);

    // Frame rendering
    (function animate() {
      canvasNode.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    })();

    this.setState({dice: dice})

    // const timeRotateInterval = setInterval(() => this.jump(dice), 100);
    // this.setState({timeRotateInterval: timeRotateInterval})
    // setTimeout (() => {
    //   clearInterval(this.state.timeRotateInterval)
    // }, 100000)
    // // setInterval(() => this.jump(dice), 600);
    // this.jump(dice);
  }

  clickToRotate () {
    this.jump(this.state.dice)
  }
  

  jump(dice) {
    const lastStatus = 0.5 * Math.PI * (-8 + Math.round(Math.random() * 16))
    
    const timeRotateInterval = setInterval(() => {
      dice.rotation.x += 1
      dice.rotation.y += 1
      dice.rotation.z += 1
    }, 50)
    setTimeout (() => {
      clearInterval(timeRotateInterval)
      dice.rotation.x = lastStatus
      dice.rotation.y = lastStatus
      dice.rotation.z = lastStatus
    }, 5000)
    // dice.rotation.x = dice.rotation.x + 0.5 * Math.PI * (-8 + Math.round(Math.random() * 16))
    // dice.rotation.y = dice.rotation.y + 0.5 * Math.PI * (-8 + Math.round(Math.random() * 16))
    // dice.rotation.z = dice.rotation.z + 0.5 * Math.PI * (-8 + Math.round(Math.random() * 16))
    // const props = {
    //   rx: dice.rotation.x,
    //   ry: dice.rotation.y,
    //   rz: dice.rotation.z
    // };
    // anime({
    //   targets: props,
    //   rx: props.rx + 0.5 * Math.PI * (-8 + Math.round(Math.random() * 16)),
    //   ry: props.ry + 0.5 * Math.PI * (-8 + Math.round(Math.random() * 16)),
    //   rz: props.rz + 0.5 * Math.PI * (-8 + Math.round(Math.random() * 16)),
    //   duration: 500,
    //   easing: "easeInOutQuart",
    //   update: function () {
    //     dice.rotation.x = props.rx;
    //     dice.rotation.y = props.ry;
    //     dice.rotation.z = props.rz;
    //   }
    // });
  }

  touchStart(e) {
    console.log('canvas', e)
    THREE.global.touchEventHandlerFactory('#canvas', 'touchstart')(e)
  }
  touchMove(e) {
    console.log('canvas', e)
    THREE.global.touchEventHandlerFactory('#canvas', 'touchmove')(e)
  }
  touchEnd(e) {
    console.log('canvas', e)
    THREE.global.touchEventHandlerFactory('#canvas', 'touchend')(e)
  }

  render () {
    return (
      <View className='dice'>
        <Canvas type='webgl' className='canvas' id='canvas' canvas-id='canvas'
          style={{ width: '100%', height: window.innerHeight + 'PX' }}
          onTouchstart={this.touchStart}
          onTouchMove={this.touchMove}
          onTouchEnd={this.touchEnd}
        ></Canvas>
        <CoverView className='rotate'>
          <Button size='mini' className='rotate-button'>Rotate</Button>
        </CoverView>
      </View>
    )
  }
}