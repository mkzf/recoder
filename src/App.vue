<template>
  <div id="app">
    <router-view :loading="loading" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'App',
  data() {
    return {
      url: 'ws://192.168.0.134:1990',
      // user: {
      //   ord: 'usr_login',
      //   usr_name: 'admin',
      //   usr_passwd: '12345',
      //   usr_type: 0
      // },
      WsHeartbeat: {
        ord: 'period_resp',
        sess: '3'
      },
      loading: false,
      setTimeoutWesocketPush: null
    }
  },
  computed: {
    ...mapGetters({ websock: 'websock' })
  },
  created() {
    this.stopF5Refresh()
    // this.sendIP()
    this.$store.dispatch('websocket/WEBSOCKET_INIT', this.url).then(() => {
      setTimeout(() => {
        this.login()
      }, 0)
    })

    // window.addEventListener('beforeunload', () => {
    //   sessionStorage.setItem('store', JSON.stringify(this.$store.state))
    // })
    // if (sessionStorage.getItem('store')) {
    //   this.$store.replaceState(
    //     Object.assign(
    //       {},
    //       this.$store.state,
    //       JSON.parse(sessionStorage.getItem('store'))
    //     )
    //   )
    //   sessionStorage.removeItem('store')
    // }
  },
  method() {
    // clearTimeout(this.setTimeoutWesocketPush)
  },
  methods: {
    sendIP() {
      this.url = 'ws:' + window.location.hostname + ':1990'
    },
    login() {
      if (sessionStorage.getItem('user')) {
        console.log('user' + sessionStorage.getItem('user'))
        setTimeout(() => {
          this.$store
            .dispatch(
              'websocket/WEBSOCKET_REIVE',
              JSON.parse(sessionStorage.getItem('user'))
            )
            .then(() => {
              // sessionStorage.removeItem('user')
              this.$store.dispatch('websocket/sendPing', this.WsHeartbeat)
            })
        }, 0)
      }
    },
    Disconnect() {
      const readyState = this.websock.readyState
      if (readyState === 0) {
        // alert('服务器连接失败')
      } else if (readyState === 3) {
        this.loading = true
      } else {
        this.location = false
      }
    },
    stopF5Refresh() {
      document.onkeydown = function(e) {
        var evt = window.event || e
        var code = evt.keyCode || evt.which
        // 屏蔽F1---F12
        if (code > 111 && code < 124) {
          if (evt.preventDefault) {
            evt.preventDefault()
          } else {
            evt.keyCode = 0
            evt.returnValue = false
          }
        }
      }
      // 禁止鼠标右键菜单
      document.oncontextmenu = function(e) {
        return false
      }
      // 阻止后退的所有动作，包括 键盘、鼠标手势等产生的后退动作。
      history.pushState(null, null, window.location.href)
      window.addEventListener('popstate', function() {
        history.pushState(null, null, window.location.href)
      })
    }
  }
}
</script>
