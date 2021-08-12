<template>
  <keep-alive>
    <div
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      class="dashboard-container"
    >
      <!-- <div class="dashboard-text">name: {{ eventlist }}</div> -->
      <div v-for="(item, index) in recoders" :key="index" class="dashboard-test">
        <div
          :class="box(item.status)"
          @click="showPick(item.recoder_guid, item.recoder_name)"
        >
          <div class="recoderName">{{ item.recoder_name }}</div>
          <div class="recoderIp">{{ item.recoder_ip }}</div>
        </div>
        <!-- <div v-if="item.status === 1" class="box-B">在线</div>
        <div v-else class="box-B">离线</div> -->
      </div>
      <div class="dashboard-pagination">
        <el-pagination
          background
          :page-size="pageSize"
          :pager-count="pagerCount"
          hide-on-single-page
          layout="prev, pager, next"
          :total="total"
          @current-change="currentChange"
        />
      </div>
    </div>
  </keep-alive>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Dashboard',
  data() {
    return {
      loading: false,
      picks: {
        rname: '',
        recoder: {
          ord: 'get_pick_devs_by_recoder',
          recoder_guid: ''
        }
      },
      pageSize: 12,
      pagerCount: 5,
      currentPage: 1,
      total: null,
      recoders: null,
      recoder_infos: [],
      sendRecoder: {
        ord: 'get_recoder_infos',
        usr_guid: 'admin'
      }
    }
  },
  computed: {
    ...mapGetters({
      eventlist: 'eventlist'
    })
    // let start = (this.currentPage - 1) * this.pageSize
    // let end = this.currentPage * this.pageSize
    // return this.recoder_infos.slice(start, end)
  },
  watch: {
    eventlist: {
      handler(val, oldval) {
        if (val) {
          if (typeof val === 'string') {
            if (JSON.parse(val).ord === 'get_recoder_infos_ret') {
              this.recoder_infos = JSON.parse(val).recoder_infos
              this.total = this.recoder_infos.length
              this.paging()
            }
            if (JSON.parse(val).ord === 'recoder_dev_login_notif') {
              var recoder = JSON.parse(val).recoder_infos
              var key = null
              for (let i = 0; i < this.recoder_infos.length; i++) {
                if (this.recoder_infos[i].recoder_guid === recoder.recoder_guid) {
                  key = i
                }
              }
              if (key) {
                console.log(key)
                this.recoder_infos.splice(key, 1, recoder)
                this.paging()
              } else {
                this.recoder_infos.push(recoder)
                this.paging()
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
    this.loading = true
    this.checkPicks()
    this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.sendRecoder)
    setTimeout(() => {
      this.loading = false
    }, 1000)
  },
  methods: {
    showPick(recoder_guid, name) {
      // this.show = false
      // this.showpick = true
      // this.recoderName = true
      // this.rname = name
      // this.picks.recoder_guid = recoder_guid
      // this.$store.dispatch('websocket/WEBSOCKET_REIVE', this.picks)
      // -------------------------------------------------------
      this.picks.rname = name
      this.picks.recoder.recoder_guid = recoder_guid
      this.$router.push({ name: 'picks', params: { picks: this.picks }})
    },
    box(status) {
      if (status === 1) {
        return 'box-A'
      } else {
        return 'box-B'
      }
    },
    checkPicks() {
      if (JSON.parse(sessionStorage.getItem('sign'))) {
        if (JSON.parse(sessionStorage.getItem('picks'))) {
          this.picks = JSON.parse(sessionStorage.getItem('picks'))
          this.$router.push({ name: 'picks', params: { picks: this.picks }})
        }
      }
    },
    currentChange(val) {
      this.currentPage = val
      this.paging()
    },
    paging() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = this.currentPage * this.pageSize
      this.recoders = this.recoder_infos.slice(start, end)
    }
  }
}
</script>
<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 15px;
    transition: width 0.28s;
  }
  // &-text {
  //   font-size: 80px;
  //   line-height: 46px;
  // }
  &-test {
    display: inline-block;
    transition: all 0.3s;
    width: 350px;
    font-size: 30px;
    color: rgb(250, 250, 250);
    margin: 25px 25px 25px 25px;
    border-radius: 10px 10px 10px 10px;
    cursor: pointer;
    overflow: hidden;
    text-align: center;
    .box-A {
      background: rgb(9, 32, 73);
      .recoderName{
        height: 100px;
        line-height: 140px;
      }
      .recoderIp{
        height: 100px;
        line-height: -140px;
      }
    }
    .box-B {
      background: rgb(123, 124, 128);
      height: 200px;
      pointer-events: none;
     .recoderName{
        line-height: 140px;
      }
      .recoderIp{
        line-height: -140px;
      }
    }
  }
  &-test:hover {
    border-color: transparent;
    border-top-color: transparent;
    border-right-color: transparent;
    border-bottom-color: transparent;
    border-left-color: transparent;
    box-shadow: 0px 5px 8px -8px rgb(0 0 0 / 18%), 0 8px 11px 0 rgb(0 0 0 / 14%),
      0 9px 15px 8px rgb(0 0 0 / 11%);
    // box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    transform: translate3d(0, -2px, 0);
  }
  &-pagination {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
