<template>
  <div>
    <div class="monitor-divs">
      <!-- <span>这是一段信息</span> -->
      <div class="monitor-pickName">AI语音分析预警系统</div>
      <div class="monitor-picktext">实时监听中</div>
      <div class="monitor-picktext">316DM-1</div>
      <div class="monitor-db">{{ db }}</div>
      <div class="monitor-canvas">
        <canvas id="canvas" ref="canvas">
          你这不行啊..不支持1canvas
        </canvas>
      </div>
    </div>
    <div class="bottom-box">
      <div class="bottom-time">
        {{ nowTime }}
      </div>
      <div id="volume" class="bottom-volume">
        <el-slider
          v-model="VolumeSetting"
          class="bottom-volume-setting"
          input-size="small"
        />
        <div class="bottom-volume-volumemsg">{{ VolumeSetting }}</div>
      </div>
      <div class="bottom-button">
        <el-row>
          <el-button type="success">开始录音</el-button>
          <el-button type="info">录音管理</el-button>
          <el-button type="warning" @click="out">退出</el-button>
          <el-button type="danger">隐藏笔录</el-button>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Monitor',
  data() {
    return {
      pick: this.$route.params.pick_aud,
      VolumeSetting: 50,
      pickName: null,
      nowTime: null,
      db: null,
      audioBufferSouceNode: null,
      audo: null,
      quit: {
        ord: 'stop_aud_tsk',
        recoder_guid: '',
        dev_guid: ''
      },
      audioContext: new (window.AudioContext || window.webkitAudioContext)(),
      requestAnimationFrame:
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequstAnimationFrame ||
        window.msRequestAnimationFrame,
      cancelAnimationFrame:
        window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.msCancelAnimationFrame,
      animationId: null
    }
  },
  computed: {
    ...mapGetters({ eventlist: 'eventlist' })
  },
  watch: {
    eventlist: {
      handler(val, oldval) {
        this.onmsg(val)
        this.sendDb(val)
      }
    },
    deep: true,
    immediate: true
  },
  created() {
    var that = this
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('pick', JSON.stringify(that.pick))
    })
    if (sessionStorage.getItem('pick')) {
      this.pick = JSON.parse(sessionStorage.getItem('pick'))
      this.out()
      sessionStorage.removeItem('pick')
      // this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.pick)
    } else {
      this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.pick)
    }
    this.getTime()
  },
  methods: {
    //   stopAudio(val) {

    //     if (typeof val === 'string') {
    //   let msg = JSON.parse(val)
    //   if(msg.ord === 'ad'){
    // 	  this.db = msg.db
    //   } else if(msg.ord === 'stop_aud_tsk'){
    // 	  this.$router.push({ path: '/' })
    //   }
    //     }
    //   },
    sendDb(val) {
      if (typeof val === 'string') {
        const msg = JSON.parse(val)
        if (msg.ord === 'ad') {
          this.db = msg.db
        } else if (msg.ord === 'inform_monitor_tsk_failed') {
          alert('网络故障，请稍后再试！！！')
          // this.$router.push({ path: '/' })
          this.out()
        }
      }
    },
    onmsg(event) {
      const that = this
      // 拿到任何消息都说明当前连接是正常的
      // console.log(typeof event.data)
      if (typeof event === 'string') {
        console.log('ok')
      } else {
        console.log(event)
        var reader = new FileReader() // 文件阅读器
        reader.readAsArrayBuffer(event) // 读取成ArrayBuffer对象
        reader.onload = function() {
          // 读取完毕
          // console.log("################recv start ####################################");
          var fileResult = that.addWavHeader(this.result, '16000', '16', '1') // 解析数据转码wav
          // console.log('123456'+fileResult)
          that.audioContext.decodeAudioData(fileResult, function(buffer) {
            that._visualize(buffer) // 播放
          })
          // console.log("################recv end ####################################");
        }
      }
    },
    // 处理音频流，转码wav
    addWavHeader(samples, sampleRateTmp, sampleBits, channelCount) {
      var dataLength = samples.byteLength
      var buffer = new ArrayBuffer(44 + dataLength)
      var view = new DataView(buffer)

      function writeString(view, offset, string) {
        for (var i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }
      var offset = 0
      /* 资源交换文件标识符 */
      writeString(view, offset, 'RIFF')
      offset += 4
      /* 下个地址开始到文件尾总字节数,即文件大小-8 */
      view.setUint32(offset, /* 32*/ 36 + dataLength, true)
      offset += 4
      /* WAV文件标志 */
      writeString(view, offset, 'WAVE')
      offset += 4
      /* 波形格式标志 */
      writeString(view, offset, 'fmt ')
      offset += 4
      /* 过滤字节,一般为 0x10 = 16 */
      view.setUint32(offset, 16, true)
      offset += 4
      /* 格式类别 (PCM形式采样数据) */
      view.setUint16(offset, 1, true)
      offset += 2
      /* 通道数 */
      view.setUint16(offset, channelCount, true)
      offset += 2
      /* 采样率,每秒样本数,表示每个通道的播放速度 */
      view.setUint32(offset, sampleRateTmp, true)
      offset += 4
      /* 波形数据传输率 (每秒平均字节数) 通道数×每秒数据位数×每样本数据位/8 */
      view.setUint32(
        offset,
        sampleRateTmp * channelCount * (sampleBits / 8),
        true
      )
      offset += 4
      /* 快数据调整数 采样一次占用字节数 通道数×每样本的数据位数/8 */
      view.setUint16(offset, channelCount * (sampleBits / 8), true)
      offset += 2
      /* 每样本数据位数 */
      view.setUint16(offset, sampleBits, true)
      offset += 2
      /* 数据标识符 */
      writeString(view, offset, 'data')
      offset += 4
      /* 采样数据总数,即数据总大小-44 */
      view.setUint32(offset, dataLength, true)
      offset += 4
      function floatTo32BitPCM(output, offset, input) {
        input = new Int32Array(input)
        for (var i = 0; i < input.length; i++, offset += 4) {
          output.setInt32(offset, input[i], true)
        }
      }
      function floatTo16BitPCM(output, offset, input) {
        input = new Int16Array(input)
        for (var i = 0; i < input.length; i++, offset += 2) {
          output.setInt16(offset, input[i], true)
        }
      }
      function floatTo8BitPCM(output, offset, input) {
        input = new Int8Array(input)
        for (var i = 0; i < input.length; i++, offset++) {
          output.setInt8(offset, input[i], true)
        }
      }
      if (sampleBits === 16) {
        floatTo16BitPCM(view, 44, samples)
      } else if (sampleBits === 8) {
        floatTo8BitPCM(view, 44, samples)
      } else {
        floatTo32BitPCM(view, 44, samples)
      }
      return view.buffer
    },
    // 播放音频
    _visualize(buffer) {
      var audioBufferSouceNode = this.audioContext.createBufferSource()
      var analyser = this.audioContext.createAnalyser()
      var gainNode = this.audioContext.createGain()
      var that = this
      // 将信号源连接到分析仪
      audioBufferSouceNode.connect(analyser)
      // 将分析仪连接到目的地（扬声器），否则我们将听不到声音
      // analyser.connect(this.audioContext.destination)
      analyser.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      gainNode.gain.value = this.VolumeSetting / 20
      // 然后将缓冲区分配给缓冲区源节点
      audioBufferSouceNode.buffer = buffer
      // 发挥作用
      if (!audioBufferSouceNode.start) {
        audioBufferSouceNode.start = audioBufferSouceNode.noteOn // 在旧浏览器中使用noteOn方法
        audioBufferSouceNode.stop = audioBufferSouceNode.noteOff // 在旧浏览器中使用noteOff方法
      }
      // 如果有的话，停止前一个声音
      if (that.animationId !== null) {
        cancelAnimationFrame(that.animationId)
      }
      audioBufferSouceNode.start(0)
      analyser.fftSize = 32
      this.audioBufferSouceNode = audioBufferSouceNode
      this.audo = this.audioContext
      this._drawSpectrum(analyser)
    },
    // 绘制------------------------------------------------
    _drawSpectrum(analyser) {
      // var canvas = document.getElementById('canvas'),
      var that = this
      var canvas = this.$refs.canvas
      var cwidth = canvas.width
      var cheight = canvas.height - 2
      var meterWidth = 10 // 频谱条宽度
      //  var gap = 2; // 频谱条间距
      var capHeight = 2
      var capStyle = 'rgba(145, 138, 138, 0.575)'
      var meterNum = cwidth / (10 + 5) // 频谱条数量
      // console.log('meterNum' + meterNum)
      var capYPositionArray = [] // 将上一画面各帽头的位置保存到这个数组
      var ctx = canvas.getContext('2d')
      var gradient = ctx.createLinearGradient(0, 0, 0, 300)
      gradient.addColorStop(1, '#0f0')
      gradient.addColorStop(0.5, '#ff0')
      gradient.addColorStop(0, '#f00')
      var drawMeter = function() {
        var array = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(array)
        // console.log('array.length:' + array)
        var step = Math.round(array.length / meterNum) // 计算采样步长
        ctx.clearRect(0, 0, cwidth, cheight)
        for (var i = 0; i < meterNum; i++) {
          var value = array[i * step] // 获取当前能量值
          if (capYPositionArray.length < Math.round(meterNum)) {
            capYPositionArray.push(value) // 初始化保存帽头位置的数组，将第一个画面的数据压入其中
          }
          ctx.fillStyle = capStyle
          // 开始绘制帽头
          if (value < capYPositionArray[i]) {
            // 如果当前值小于之前值
            ctx.fillRect(
              i * 12,
              cheight - --capYPositionArray[i],
              meterWidth,
              capHeight
            ) // 则使用前一次保存的值来绘制帽头
          } else {
            ctx.fillRect(i * 12, cheight - value * 0.6, meterWidth, capHeight) // 否则使用当前值直接绘制
            capYPositionArray[i] = value * 0.6
          }
          // 开始绘制频谱条
          ctx.fillStyle = gradient
          ctx.fillRect(i * 12, cheight - value * 0.5 + capHeight, meterWidth, cheight)
          console.log('i:------' + i + 'cheight:------' + cheight + 'value:------' + value + 'capheight:------' + capHeight + 'meterWidth:------' + meterWidth)
        }
        that.animationId = requestAnimationFrame(drawMeter)
      }
      that.animationId = requestAnimationFrame(drawMeter)
    },
    getTime() {
      var that = this
      var gettime = function() {
        var myDate = new Date()
        var myYear = myDate.getFullYear() // 获取完整的年份(4位,1970-????)
        var myMonth = myDate.getMonth() + 1 // 获取当前月份(0-11,0代表1月)
        var myToday = myDate.getDate() // 获取当前日(1-31)
        var myDay = myDate.getDay() // 获取当前星期X(0-6,0代表星期天)
        var myHour = myDate.getHours() // 获取当前小时数(0-23)
        var myMinute = myDate.getMinutes() // 获取当前分钟数(0-59)
        var mySecond = myDate.getSeconds() // 获取当前秒数(0-59)
        var week = [
          '星期日',
          '星期一',
          '星期二',
          '星期三',
          '星期四',
          '星期五',
          '星期六'
        ]
        that.nowTime =
          myYear +
          '年' +
          fillZero(myMonth) +
          '月' +
          fillZero(myToday) +
          '日' +
          '  ' +
          fillZero(myHour) +
          ':' +
          fillZero(myMinute) +
          ':' +
          fillZero(mySecond) +
          '  ' +
          week[myDay] +
          '  '
      }
      var fillZero = function(str) {
        var realNum
        if (str < 10) {
          realNum = '0' + str
        } else {
          realNum = str
        }
        return realNum
      }
      setInterval(gettime, 1000)
    },
    out() {
      this.quit.recoder_guid = this.pick.recoder_guid
      this.quit.dev_guid = this.pick.dev_guid
      this.audioContext.close()
      cancelAnimationFrame(this.animationId)
      this.audioBufferSouceNode.buffer = null
      this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.quit).then(() => {
        sessionStorage.removeItem('pick')
        // this.audioBufferSouceNode.buffer = null
        this.$router.push({ path: '/' })
      })
    },
    Abnormalend() {
      this.quit.recoder_guid = this.pick.recoder_guid
      this.quit.dev_guid = this.pick.dev_guid
      cancelAnimationFrame(this.animationId)
      this.audioContext.close()
      this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.quit)
    }
  }
}
</script>

<style lang="scss" scoped>
 .monitor {
  &-devs {
    transition: width 0.28s;
    background-color: black;
  }
 &-pickName {
    margin: 0 auto;
    background: rgb(11, 11, 12);
    line-height: 50px;
    cursor: pointer;
    color: rgb(250, 250, 250);
    font-size: 50px;
    text-align: center;
  }
  &-picktext {
    margin: 0 auto;
    line-height: 30px;
    cursor: pointer;
    color: rgb(10, 9, 9);
    font-size: 30px;
    text-align: center;
  }
  &-db {
    font-size: 30px;
    text-align: center;
  }
  &-canvas {
    width: 400px;
    height: 600px;
    margin-left: 200px;
    margin: 0 auto;
    padding-bottom: 100px;
    #canvas {
      width: 100%;
      height: 100%;
    }
  }
}
.bottom {
  &-box {
    width: 100%;
    height: 60px;
    margin-top: 50px;
    display: inline-block;
  }
  &-time {
    display: inline-block;
    width: 25%;
    font-size: 25px;
    margin-left: 10px;
  }
  &-button {
    display: inline-block;
  }
  &-volume {
    width: 200px;
    height: 100%;
    margin-left: 600px;
    display: inline-block;
    &-setting {
      width: 150px;
      height: 60px;
      padding-top: 35px;
      padding-right: 15px;
      margin: 0 auto;
      display: inline-block;
    }
    &-volumemsg {
      display: inline-block;
    }
  }
}
</style>
