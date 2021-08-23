<template>
  <!-- <span>{{ item.dev_guid }}</span>
      <span>{{ item.name }}</span>
      <span>{{ item.channel }}</span>
      <span>{{ item.ip }}</span>
      <span>{{ item.url }}</span>
       <span>{{ item.arithmetic }}</span> -->
  <!-- <span>{{ item.state }}</span> -->
  <div class="Pick-devs">
    <div class="Pick-recoder" @click="sendRecoder">
      {{ picks.rname }}
    </div>
    <div
      v-for="(item, index) in pick_infos"
      :key="index"
      class="Pick-box"
    >
      <div class="block" :style="pickStyle(item.state)" @click="openMoniter(item.dev_guid)">
        <div class="dev">{{ item.channel }}</div>
        <div class="dev">{{ item.name }}</div>
        <div class="dev">
          算法:<input
            class="check"
            type="checkbox"
            name="arithmetic"
            value="item.arithmetic"
            :checked="item.arithmetic"
            @click.stop="checked($event)"
          >
        </div>
        <div v-if="item.state === 0" class="dev">离线</div>
        <div v-else-if="item.state === 1" class="dev">在线</div>
        <div v-else-if="item.state === 2" class="dev">
          定时录音中
        </div>
        <div v-else-if="item.state === 3" class="dev">
          声压告警
        </div>
        <div v-else-if="item.state === 4" class="dev">
          关键字告警
        </div>
        <div v-else class="dev">未知状态</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Pick',
  data() {
    return {
      arithmetic: null,
      ash: {
        background: 'rgb(121, 121, 121)'
      },
      red: {
        background: 'rgb(236, 53, 78)',
        animation: 'fade 1000ms infinite'
      },
      blue: {
        background: 'rgb(70, 81, 240)'
      },
      picks: this.$route.params.picks,
      state: null,
      pick_infos: null,
      dialogVisible: false,
      sign: true,
      pick_aud: {
        ord: 'get_pick_dev_aud',
        recoder_guid: '',
        dev_guid: ''
      }
    }
  },
  computed: {
    ...mapGetters({ eventlist: 'eventlist' })
  },
  watch: {
    eventlist: {
      handler(val, oldval) {
        if (val) {
          if (typeof val === 'string') {
            const arr = {
              dev_guid: '',
              name: '',
              channel: 0,
              ip: '',
              url: '',
              arithmetic: 0,
              state: 0
            }
            const array = []
            for (let i = 1; i <= 32; i++) {
              arr.channel = i
              var pick = JSON.stringify(arr)
              array.push(JSON.parse(pick))
            }
            const msg = JSON.parse(val)
            if (msg.ord === 'get_pick_devs_by_recoder_ret') {
              if (msg.pick_infos) {
                var picks = msg.pick_infos
                for (let j = 0; j < array.length; j++) {
                  for (let k = 0; k < picks.length; k++) {
                    if (array[j].channel === picks[k].channel) {
                      array[j] = picks[k]
                    }
                  }
                }
                array.sort(function(a, b) {
                  return a.channel - b.channel
                })
                this.pick_infos = array
                // console.log('pick_infos:' + JSON.stringify(this.pick_infos))
              } else {
                this.pick_infos = array
                // console.log('null:' + JSON.stringify(this.pick_infos))
              }
            }
            if (msg.ord === 'dev_update_state') {
              if (msg.recoder_guid === this.picks.recoder.recoder_guid) {
                for (const i in this.pick_infos) {
                  if (this.pick_infos[i].dev_guid === msg.dev_guid) {
                    this.pick_infos.state = msg.state
                    return
                  }
                }
              }
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    var that = this
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('picks', JSON.stringify(that.picks))
    })
    if (sessionStorage.getItem('picks')) {
      this.picks = JSON.parse(sessionStorage.getItem('picks'))
      this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.picks.recoder)
      sessionStorage.removeItem('picks')
    } else {
      this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.picks.recoder)
    }
  },
  beforeDestroy() {
    if (this.sign) {
      sessionStorage.setItem('picks', JSON.stringify(this.picks))
    }
    sessionStorage.setItem('sign', JSON.stringify(this.sign))
  },
  methods: {
    pickStyle(state) {
      if (state === 0) {
        return this.ash
      } else if (state === 2) {
        return this.blue
      } else if (state === 3) {
        return this.red
      } else if (state === 4) {
        return this.red
      }
    },
    checked(event) {
      console.log(this.arithmetic)
      if (event.target.checked) {
        // console.log('123' + event.target.checked)
        this.arithmetic = true
      } else {
        this.arithmetic = false
      }
      console.log(this.arithmetic)
    },
    Checkstatus(state) {
      this.state = state
    },
    // ------------------
    // this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.pick)
    sendRecoder() {
      this.sign = false
      this.$router.push({ path: '/' })
    },
    openMoniter(dev_guid) {
      this.pick_aud.recoder_guid = this.picks.recoder.recoder_guid
      this.pick_aud.dev_guid = dev_guid
      this.$router.push({ name: 'monitor', params: { pick_aud: this.pick_aud }})
    }
  }
}
</script>

<style lang="scss">
.Pick {
  &-divs {
    transition: width 0.28s;
  }
  &-box {
    display: inline-block;
    transition: all 0.4s;
    width: 266px;
    font-size: 18px;
    background: rgb(98, 189, 113);
    color: rgb(229, 240, 240);
    text-align: center;
    margin-top: 12px;
    // margin-right: 10px;
    margin-left: 10px;
    border-radius: 8px 8px 8px 8px;
    cursor: pointer;
    overflow: hidden;
    .block {
      display: inline-block;
      vertical-align: center;
      width: 100%;
    }
    .dev {
    //   vertical-align: center;
      height: 50px;
      line-height: 50px;
    //   animation: fade 1000ms infinite;
    // -webkit-animation: fade 1000ms infinite;
    }
  }
  &-box:hover {
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
    transform: translate3d(0, -5px, 0);
  }
  &-recoder {
    width: 100%;
    height: 50px;
    background: rgb(113, 101, 223);
    line-height: 50px;
    cursor: pointer;
    color: rgb(250, 250, 250);
    font-size: 50px;
    text-align: center;
  }
}
@keyframes fade {
            from {
                opacity: 1.0;
            }
            33% {
                opacity: 0.3;
            }
            66% {
                opacity: 0.7;
            }
            to {
                opacity: 1.0;
            }
        }
        @-webkit-keyframes fade {
            from {
                opacity: 1.0;
            }
            33% {
                opacity: 0.3;
            }
            66% {
                opacity: 0.7;
            }
            to {
                opacity: 1.0;
            }
        }
</style>
