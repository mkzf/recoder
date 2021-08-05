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
          this.$store.dispatch(
            'websocket/WEBSOCKET_REIVE',
            JSON.parse(sessionStorage.getItem('user'))
          ).then(() => {
            // sessionStorage.removeItem('user')
            this.$store.dispatch('websocket/sendPing', this.WsHeartbeat)
          })
        }, 0)
      }
    },
    Disconnect() {
      const readyState = this.websock.readyState
      if (readyState === 3) {
        this.loading = true
      } else {
        this.location = false
      }
    }
  }
}
</script>
