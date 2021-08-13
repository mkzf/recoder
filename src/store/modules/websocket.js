// import { getters } from '../getters'
const state = {
  urls: null,
  setIntervalWesocketPush: null,
  websock: null, // websock变量
  eventlist: null, // 录音主机
  picklist: null, // 网络拾音器
  WsHeartbeat: null
}
// const obj = {
//   ord: 'recoder_dev_login_notif',
//   recoder_info: {
//     recoder_guid: '1',
//     recoder_name: '1',
//     recoder_ip: '192.168.1.124',
//     recoder_type: '2',
//     version: 'xxx',
//     release_time: '20210104',
//     recoder_model: '313E',
//     status: 0
//   }
// }
// getters.js
// const getters = {
//   eventlist(state) {
//     return state.eventlist
//   },
//   websock(state) {
//     return state.websock
//   }
// }
const mutations = {
  // 申明并连接websocket，
  // 在mutation也能定义websocket的一些方法，但是在vuex严格模式下，异步处理数据浏览器会抛出错误。所以只是申明了websocket
  WEBSOCKET_INIT(state, url) {
    state.websock = new WebSocket(url)
  },
  // 将接收到的数据赋值
  WEBSOCKET_REIVE(state, data) {
    state.eventlist = data
  },
  sendPing(state, data) {
    state.WsHeartbeat = data
  }
}
// let setIntervalWesocketPush = null
// let message = null
// 打开WS之后发送心跳
// function onopenWS() {
//   clearInterval(setIntervalWesocketPush)
//   console.log('已连接')
//   // 发送心跳
//   sendPing()
// }
// // 连接失败重连
// function onerrorWS() {
//   console.log('连接失败')
//   clearInterval(setIntervalWesocketPush)
//   state.websock.close()
//   state.websock = ''
//   mutations.WEBSOCKET_INIT(state, state.urls) // 重连
// }
// WS数据接收统一处理
// function im_msg(e) {
//   console.log(e)
//   const msg = JSON.parse(e.data)
//   if (msg.ord === 'usr_login_ret') {
//     // let array = []
//     // array = msg.recoder_infos
//     // array.push(obj.recoder_info)
//     state.eventlist = msg.recoder_infos
//     // // 发送心跳
//     console.log('123' + JSON.stringify(state.eventlist))
//   }
//   if (msg.ord === 'get_pick_devs_by_recoder_ret') {
//     let array = []
//     array = msg.pick_infos
//     array.sort(function(a, b) {
//       return a.channel - b.channel
//     })
//     state.picklist = array
//     // state.picklist = msg.pick_infos
//     console.log('456' + JSON.stringify(state.picklist))
//   }
// clearInterval(setIntervalWesocketPush)
// }
/** 关闭WS */
// function oncloseWS() {
//   // let i = 0
//   clearInterval(setIntervalWesocketPush)
//   console.log('websocket已断开')
//   state.setIntervalWesocketPush = setInterval(() => {
//   // i++
//   // console.log('重连中', i)
//     console.log('重连中')
//     state.websock = ''
//     console.log(state.urls)
//     mutations.WEBSOCKET_INIT(state, state.urls) // 重连
//   }, 5000)
// }
const actions = {
  WEBSOCKET_INIT({ dispatch, commit }, url) {
    if (url) {
      state.urls = url
    }
    if (!state.websock) {
      commit('WEBSOCKET_INIT', state.urls)
      state.websock.onopen = function() {
        if (state.setIntervalWesocketPush) {
          clearInterval(state.setIntervalWesocketPush)
          console.log('连接成功！')
          if (sessionStorage.getItem('user')) {
            const user = JSON.parse(sessionStorage.getItem('user'))
            dispatch('WEBSOCKET_REIVE', user)
            dispatch('sendPing', state.WsHeartbeat)
          }
        }
      }
      // onopenWS

      state.websock.οnerrοr = function(e) { // 错误
        console.log('ws错误!')
        console.log(e)
      }
      // onerrorWS
      // websocket与后端链接的数据，为异步链接的方式！
      state.websock.onmessage = function(callBack) {
        console.log('ws接收', callBack.data)
        // 后端返回的数据，在mutations内进行修改
        commit('WEBSOCKET_REIVE', callBack.data)
      }
      // im_msg
      state.websock.onclose = function oncloseWS() {
        let i = 0
        clearInterval(state.setIntervalWesocketPush)
        console.log('websocket已断开')
        state.setIntervalWesocketPush = setInterval(() => {
          i++
          console.log('重连中', i)
          state.websock = ''
          dispatch('WEBSOCKET_INIT', state.urls) // 重连
        }, 3000)
      }
      // oncloseWS
    } else {
      // clearInterval(state.setIntervalWesocketPush)
      console.log('websocket已创建')
    }
  },
  // 发送消息
  WEBSOCKET_REIVE({ commit }, data) {
    if (data !== null && data !== '') {
      if (state.websock !== null && state.websock.readyState === 3) {
        state.websock.close()
      // createSocket(url) // 重连
      } else if (state.websock.readyState === 1) {
        state.websock.send(JSON.stringify(data))
        console.log('ws发送:' + JSON.stringify(data))
      } else if (state.websock.readyState === 0) {
        setTimeout(() => {
          state.websock.send(JSON.stringify(data))
        }, 3000)
      }
    } else {
      state.eventlist = null
    }
    //   if (state.websock !== null && state.websock.readyState === 3) {
    //   state.websock.close()
    //   // createSocket(url) // 重连
    // } else if (state.websock.readyState === 1) {
    //   state.websock.send(JSON.stringify(data))
    //   console.log('ws发送:' + JSON.stringify(data))
    // } else if (state.websock.readyState === 0) {
    //   setTimeout(() => {
    //     state.websock.send(JSON.stringify(data))
    //   }, 3000)
    // }
  },
  /** 发送心跳 */
  sendPing({ commit }, WsHeartbeat) {
    commit('sendPing', WsHeartbeat)
    state.websock.send(JSON.stringify(state.WsHeartbeat))
    console.log('心跳包发送成功', state.WsHeartbeat)
    state.setIntervalWesocketPush = setInterval(() => {
      console.log('连接状态检测中')
      state.websock.send(JSON.stringify(state.WsHeartbeat))
    }, 30000)
  }
}

export default {
  namespaced: true,
  state,
  // getters,
  mutations,
  actions
}
